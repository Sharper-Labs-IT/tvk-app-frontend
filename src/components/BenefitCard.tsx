
import React from 'react'

interface BenefitCardProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    tags: string[];
}

const BenefitCard: React.FC<BenefitCardProps> = ({
    icon,
    title,
    description,
    tags,
}) => {
    return(
        <div className="flex flex-col rounded-3xl border border-[#1d2340] bg-[#07091a] p-6 shadow-lg">
            {icon && (
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#181e37] text-[#f7c948]">{icon}</div>
            )}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{description}</p>

            {tags.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-2'>
                    {tags.map((tag)=> (
                        <span key={tag} className='rounded-full bg-[#181e37] px-3 py-1 text-xs font-medium text-slate-100'>{tag}</span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BenefitCard;