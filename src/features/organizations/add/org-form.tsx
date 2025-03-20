import { MinimalTiptapEditor } from "@/components/minimal-tiptap"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useState } from "react"
import { Content } from '@tiptap/react'


const OrganizationForm = () => {
    const [value, setValue] = useState<Content>('')

    return (
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
    )
}

export default OrganizationForm