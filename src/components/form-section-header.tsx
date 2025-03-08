import { FC } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
}

const FormSectionHeader: FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div>
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
        {title}
      </h4>
      <p className='text-sm text-muted-foreground'>
        {description}
      </p>
    </div>

  )
}

export default FormSectionHeader