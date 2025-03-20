import { MinimalTiptapEditor } from "@/components/minimal-tiptap"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState } from "react"
import { Content } from '@tiptap/react'
import ImageUpload from "@/components/image-upload"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const organizationFormSchema = z
    .object({
        description: z.string(),
        assetId: z.string().nullable(),
        assetURL: z.string().nullable(),
    })

type OrganizationFormValues = z.infer<typeof organizationFormSchema>

const OrganizationForm = () => {
    const [value, setValue] = useState<Content>('')
    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: {
            description: '',
            assetId: null,
            assetURL: null
        }
    })

    const assetId = form.watch("assetId")
    const assetURL = form.watch("assetURL")

    const handleImageUpload = (assetId: string | null, assetURL: string | null) => {
        form.setValue("assetId", assetId);
        form.setValue("assetURL", assetURL);
    }

    return (
        <div>
            <div>
                <ImageUpload
                    handleImage={handleImageUpload}
                />
            </div>
            <TooltipProvider>
                <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="Enter your description..."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                />
            </TooltipProvider>
        </div>

    )
}

export default OrganizationForm