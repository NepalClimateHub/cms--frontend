import { useCallback } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Button } from '@/ui/shadcn/button'
import { X } from 'lucide-react'
import { BlogFormValues } from '@/schemas/blog'

/* ─────────────────────────────────────────────────────────────
   Utility: estimate reading time (avg 200 wpm on plain text)
───────────────────────────────────────────────────────────── */
function estimateReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

/* ─────────────────────────────────────────────────────────────
   Utility: format date as "Jun 30, 2026"
───────────────────────────────────────────────────────────── */
function formatDate(date: Date | string | undefined): string {
  if (!date) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  } catch {
    return ''
  }
}

/* ─────────────────────────────────────────────────────────────
   Image-caption JS post-processor (mirrors the Astro site).
   Groups consecutive <img> into .image-grid, appends
   .image-caption paragraphs from the `caption` attribute.
───────────────────────────────────────────────────────────── */
function runImagePostProcessor(container: HTMLElement) {
  const children = Array.from(container.children) as HTMLElement[]
  let i = 0
  let figureIndex = 1

  while (i < children.length) {
    const el = children[i]

    if (el.tagName === 'IMG') {
      const run: HTMLElement[] = [el]
      let j = i + 1
      while (j < children.length && children[j].tagName === 'IMG') {
        run.push(children[j])
        j++
      }

      if (run.length >= 2) {
        // Multiple consecutive images → grid
        const grid = document.createElement('div')
        grid.className = 'image-grid'

        run.forEach((img) => {
          const wrapper = document.createElement('div')
          wrapper.className = 'image-wrapper'
          const caption = img.getAttribute('caption')
          const cloned = img.cloneNode(true) as HTMLElement
          wrapper.appendChild(cloned)
          if (caption) {
            const p = document.createElement('p')
            p.className = 'image-caption'
            const label = document.createElement('span')
            label.className = 'figure-label'
            label.textContent = `Figure ${figureIndex}: `
            p.appendChild(label)
            p.appendChild(document.createTextNode(caption))
            wrapper.appendChild(p)
            figureIndex++
          }
          grid.appendChild(wrapper)
        })

        const firstImg = run[0]
        firstImg.parentNode?.insertBefore(grid, firstImg)
        run.forEach((img) => img.remove())
        i = j
      } else {
        // Single image
        const caption = el.getAttribute('caption')
        if (caption && el.parentNode) {
          const p = document.createElement('p')
          p.className = 'image-caption'
          const label = document.createElement('span')
          label.className = 'figure-label'
          label.textContent = `Figure ${figureIndex}: `
          p.appendChild(label)
          p.appendChild(document.createTextNode(caption))
          el.parentNode.insertBefore(p, el.nextSibling)
          figureIndex++
        }
        i++
      }
    } else {
      i++
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   Main component
   Uses Radix Dialog primitives directly so we can render a
   true full-screen overlay without the shadcn default close
   button and centering transform fighting us.
───────────────────────────────────────────────────────────── */
interface BlogPreviewModalProps {
  open: boolean
  onClose: () => void
  values: BlogFormValues
}

export function BlogPreviewModal({ open, onClose, values }: BlogPreviewModalProps) {
  // Callback ref: fires as soon as the div is attached to the DOM (or detached when null).
  // This bypasses any Radix/animation timing issues that prevent useEffect from seeing the element.
  const contentCallbackRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      el.innerHTML = values.content ?? ''
      runImagePostProcessor(el)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, values.content]
  )

  const authorName = values.author || 'Unknown Author'
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=1a1b1e&color=cefe00&size=72`
  const readTime = estimateReadTime(values.content ?? '')
  const dateStr = formatDate(values.publishedDate)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className='fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />

        {/* Full-screen dialog */}
        <DialogPrimitive.Content
          className='fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          style={{ fontFamily: 'Roboto, sans-serif' }}
          aria-describedby={undefined}
        >
          <style>{PREVIEW_CSS}</style>

          <DialogPrimitive.Title className='sr-only'>
            Blog Preview
          </DialogPrimitive.Title>

          {/* ── Top bar ── */}
          <div className='flex shrink-0 items-center justify-between border-b bg-white px-6 py-3 shadow-sm'>
            <div className='flex items-center gap-3'>
              <span
                className='rounded-full px-3 py-1 text-xs font-bold'
                style={{ background: '#cefe00', color: '#1a1b1e' }}
              >
                PREVIEW
              </span>
              <span className='text-sm text-gray-500'>
                This is how your blog will look on nepalclimatehub.org
              </span>
            </div>
            <DialogPrimitive.Close asChild>
              <Button type='button' size='icon' variant='ghost' className='shrink-0'>
                <X className='h-5 w-5' />
              </Button>
            </DialogPrimitive.Close>
          </div>

          {/* ── Scrollable preview body ── */}
          <div className='flex-1 overflow-y-auto'>
            <main className='preview-main-container'>
              {/* Breadcrumb */}
              <div className='preview-mini-nav'>
                <a href='#'>Home</a>
                <span style={{ color: '#364FC7' }}> / </span>
                <a href='#'>Blogs</a>
              </div>

              <section className='preview-blog-detail-section'>
                <header className='preview-blog-header preview-section-container'>
                  <h1 className='preview-blog-title'>
                    {values.title || (
                      <span className='preview-placeholder'>Untitled Blog</span>
                    )}
                  </h1>

                  {/* Author / meta row */}
                  <div className='preview-meta-container'>
                    <figure className='preview-author-info'>
                      <figcaption className='preview-author'>
                        <div className='preview-author-image-container'>
                          <img
                            src={avatarUrl}
                            alt={authorName}
                            className='preview-author-img'
                          />
                        </div>
                        <span className='preview-author-name'>By {authorName}</span>
                      </figcaption>
                      {dateStr && (
                        <>
                          <span className='preview-separator'>|</span>
                          <time className='preview-info-text'>{dateStr}</time>
                        </>
                      )}
                      <span className='preview-separator'>|</span>
                      <span className='preview-info-text'>{readTime}</span>
                    </figure>

                    {/* Share — decorative only in preview */}
                    <div className='preview-share-container'>
                      <span className='preview-share-label'>Share:</span>
                      <div className='preview-share-icons'>
                        <button type='button' aria-label='Copy link' className='preview-icon'>
                          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M16 8V6C16 4.89543 15.1046 4 14 4H6C4.89543 4 4 4.89543 4 6V14C4 15.1046 4.89543 16 6 16H8' />
                            <rect x='8' y='8' width='12' height='12' rx='2' />
                          </svg>
                        </button>
                        <button type='button' aria-label='Share on LinkedIn' className='preview-icon'>
                          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z' />
                            <path d='M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 1 0-4 0' />
                          </svg>
                        </button>
                        <button type='button' aria-label='Share on Facebook' className='preview-icon'>
                          <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M7 10v4h3v7h4v-7h3l1-4h-4v-2a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2h-3' />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Two-column grid: article + sidebar */}
                <div className='preview-blog-grid preview-section-container'>
                  {/* Article content */}
                  <article className='preview-blog-content'>
                    {values.bannerImageUrl && (
                      <img
                        src={values.bannerImageUrl}
                        alt={values.title || 'Blog banner'}
                        className='preview-banner-image'
                      />
                    )}
                    <div
                      ref={contentCallbackRef}
                      className='html-rendered'
                      id='html-renderer-preview'
                    />
                    {!values.content && (
                      <p className='preview-placeholder'>No content yet…</p>
                    )}
                  </article>

                  {/* Sidebar */}
                  <aside className='preview-blog-sidebar'>
                    {/* About Author */}
                    <div className='preview-author-section'>
                      <h2 className='preview-section-title'>About Author</h2>
                      <div className='preview-author-container'>
                        <div className='preview-author-image-container-lg'>
                          <img
                            src={avatarUrl}
                            alt={authorName}
                            className='preview-author-img-lg'
                          />
                        </div>
                        <div>
                          <div className='preview-author-name-lg'>{authorName}</div>
                          {values.category && (
                            <div className='preview-author-role'>{values.category}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stay Connected */}
                    <div className='preview-stay-connected'>
                      <h2 className='preview-sidebar-title'>Stay Connected</h2>
                      <p>Subscribe to future news and updates.</p>
                      <div className='preview-email-wrapper'>
                        <input
                          type='email'
                          placeholder='Email'
                          disabled
                          className='preview-email-input'
                        />
                        <button type='button' disabled className='preview-email-btn'>
                          Submit
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </section>
            </main>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/* ─────────────────────────────────────────────────────────────
   Scoped CSS replicating the public blog page styles exactly
───────────────────────────────────────────────────────────── */
const PREVIEW_CSS = `
  .preview-main-container { display:flex; flex-direction:column; min-height:100%; background:#fff; }
  .preview-section-container { max-width:1280px; margin:0 auto; padding:0 24px; }
  .preview-mini-nav { max-width:1280px; margin:20px auto 12px; padding:0 24px; }
  .preview-mini-nav a { text-decoration:none; font-size:12px; line-height:14px; color:#364fc7; }

  .preview-blog-detail-section { padding:0 0 64px; }
  .preview-blog-header { padding-top:28px; padding-bottom:20px; }
  .preview-blog-title {
    font-size:clamp(22px,4vw,38px); font-weight:800; color:#1a1b1e;
    line-height:1.2; margin-bottom:20px;
    font-family:'Zilla Slab',Georgia,serif;
  }
  .preview-placeholder { color:#9ca3af; font-style:italic; }

  .preview-meta-container { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:4px; }
  .preview-author-info { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin:0; }
  .preview-author { display:flex; align-items:center; gap:8px; }
  .preview-author-image-container { width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0; }
  .preview-author-img { width:100%; height:100%; object-fit:cover; display:block; margin:0 !important; border-radius:50% !important; }
  .preview-author-name { font-weight:600; font-size:14px; color:#1a1b1e; }
  .preview-separator { color:#9ca3af; font-size:14px; }
  .preview-info-text { font-size:14px; color:#6b7280; }

  .preview-share-container { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  .preview-share-label { font-weight:800; color:#1a1b1e; font-size:14px; }
  .preview-share-icons { display:flex; gap:12px; align-items:center; }
  .preview-icon { border:none; background:none; cursor:pointer; padding:0; display:flex; align-items:center; }
  .preview-icon svg { stroke:#1a1b1e; transition:fill .2s; }
  .preview-icon:hover svg { fill:#cefe00; }

  .preview-blog-grid { display:grid; grid-template-columns:1fr 340px; gap:48px; padding-top:32px; align-items:start; }
  @media(max-width:900px){ .preview-blog-grid{ grid-template-columns:1fr; } }

  .preview-banner-image { width:100%; max-height:480px; object-fit:cover; border-radius:8px; margin-bottom:28px; display:block; }

  .preview-blog-sidebar { display:flex; flex-direction:column; gap:24px; }
  .preview-author-section { background:#f9fafb; border-radius:12px; padding:24px; }
  .preview-section-title { font-size:15px; font-weight:700; color:#1a1b1e; margin-bottom:16px; }
  .preview-author-container { display:flex; gap:12px; align-items:center; }
  .preview-author-image-container-lg { width:56px; height:56px; border-radius:50%; overflow:hidden; flex-shrink:0; }
  .preview-author-img-lg { width:100%; height:100%; object-fit:cover; display:block; margin:0 !important; border-radius:50% !important; }
  .preview-author-name-lg { font-weight:700; font-size:15px; color:#1a1b1e; }
  .preview-author-role { font-size:13px; color:#6b7280; margin-top:2px; }
  .preview-stay-connected { background:#f9fafb; border-radius:12px; padding:24px; }
  .preview-sidebar-title { font-size:15px; font-weight:700; color:#1a1b1e; margin-bottom:12px; }
  .preview-stay-connected p { font-size:14px; color:#6b7280; margin-bottom:14px; }
  .preview-email-wrapper { display:flex; gap:8px; }
  .preview-email-input { flex:1; border:1px solid #e5e7eb; border-radius:6px; padding:8px 12px; font-size:14px; opacity:.6; background:#fff; }
  .preview-email-btn { background:#1a1b1e; color:#cefe00; border:none; border-radius:6px; padding:8px 16px; font-size:14px; font-weight:600; cursor:not-allowed; opacity:.7; }

  /* ── HTML-rendered content (mirrors public site exactly) ── */
  .html-rendered .image-grid{ display:grid!important; grid-template-columns:repeat(2,1fr)!important; gap:1rem!important; margin:1rem 0!important; }
  .html-rendered .image-wrapper{ display:flex!important; flex-direction:column!important; }
  .html-rendered .image-caption{ font-size:14px!important; color:rgba(26,27,30,.7)!important; font-style:italic!important; font-weight:400!important; line-height:180%!important; margin-top:.5rem!important; margin-bottom:0!important; }
  .html-rendered .figure-label{ font-weight:600!important; font-style:italic!important; color:rgba(26,27,30,.7)!important; }
  .html-rendered ul{ list-style:disc!important; list-style-position:inside!important; padding-left:.75rem!important; margin:0 0 1rem!important; }
  .html-rendered ol{ list-style:decimal!important; list-style-position:inside!important; padding-left:.75rem!important; margin:0 0 1rem!important; }
  .html-rendered li{ display:list-item!important; list-style:inherit!important; margin:0 0 8px!important; }
  .html-rendered ul li::marker{ content:"• "!important; color:#374151!important; font-weight:700!important; }
  .html-rendered ol li::marker{ color:#374151!important; font-weight:700!important; }
  .html-rendered li>p,.html-rendered li>.text-node{ display:inline!important; margin:0!important; }
  .html-rendered h1,.html-rendered h2,.html-rendered h3,.html-rendered h4,.html-rendered h5,.html-rendered h6,.html-rendered .heading-node{ font-weight:700!important; color:#111827!important; margin-top:1.5rem!important; margin-bottom:1rem!important; }
  .html-rendered h2{ font-size:1.5rem!important; }
  .html-rendered h3{ font-size:1.25rem!important; }
  .html-rendered p,.html-rendered .text-node{ margin-bottom:12px!important; line-height:1.7!important; white-space:pre-line!important; color:#1a1b1e; font-size:16px; }
  .html-rendered li{ white-space:pre-line!important; }
  .html-rendered a,.html-rendered .link{ color:#2563eb!important; text-decoration:none!important; }
  .html-rendered a:hover{ text-decoration:underline!important; }
  .html-rendered img{ max-width:100%!important; height:auto!important; display:block!important; margin:8px 0!important; border-radius:4px; }
  .html-rendered .image-wrapper img{ width:100%!important; aspect-ratio:.95!important; object-fit:cover!important; margin:0!important; border-radius:0 !important; }
  .html-rendered div{ margin-bottom:1rem!important; }
  .html-rendered blockquote,.html-rendered .block-node{ margin:1rem 0!important; padding-left:1rem!important; border-left:3px solid #cefe00!important; font-style:italic!important; }
  .html-rendered br{ margin-bottom:.5rem!important; }
  .html-rendered strong{ font-weight:700; }
  .html-rendered em{ font-style:italic; }
  .html-rendered code{ background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:.875em; font-family:monospace; }
  .html-rendered pre{ background:#1e1e2e; color:#cdd6f4; padding:16px; border-radius:8px; overflow-x:auto; margin-bottom:1rem!important; }
  .html-rendered pre code{ background:none; padding:0; font-size:.875rem; }
  @media(max-width:640px){ .html-rendered .image-grid{ grid-template-columns:1fr!important; } }
`

export default BlogPreviewModal
