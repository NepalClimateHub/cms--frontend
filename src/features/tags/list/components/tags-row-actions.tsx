import Tags from "@/schemas/tags/tags"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { Row } from "@tanstack/react-table"
import { FC } from "react"

type TagsRowActionProps = {
    row: Row<Tags>
}

const TagsRowAction: FC<TagsRowActionProps> = ({ }) => {
    const handleEdit = () => {
        console.log("ok")
        // navigate({
        //     to: '/Tags/$roleId',
        //     params: {
        //         roleId: row.original.id
        //     }
        // })
    }

    return (
        <div className="flex items-center justify-center gap-4">
            <IconEdit onClick={handleEdit} className="cursor-pointer" size={16} />
            <IconTrash className="cursor-pointer" size={16} />
        </div>
    )
}

export default TagsRowAction