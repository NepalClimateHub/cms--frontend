import { Roles } from "@/schemas/roles/roles"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { useNavigate } from "@tanstack/react-router"
import { Row } from "@tanstack/react-table"
import { FC } from "react"

type RolesRowActionProps = {
    row: Row<Roles>
}

const RolesRowAction: FC<RolesRowActionProps> = ({ row }) => {
    const navigate = useNavigate()
    const handleEdit = () => {
        navigate({
            to: '/roles/$roleId',
            params: {
                roleId: row.original.id
            }
        })
    }

    return (
        <div className="flex items-center justify-center gap-4">
            <IconEdit onClick={handleEdit} className="cursor-pointer" size={16} />
            <IconTrash className="cursor-pointer" size={16} />
        </div>
    )
}

export default RolesRowAction