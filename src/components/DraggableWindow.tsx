import React from 'react'
import Draggable from 'react-draggable'

export const DraggableWindow = ({
    className,
    title,
    children,
    onClose
}: {
    className: string,
    title: string,
    children: React.ReactNode,
    onClose: () => any
}) => {
    return (<Draggable handle=".window__top-bar">
        <div className={`${className} window`}>
            <div className="window__top-bar">
                <div className="window__top-bar__title">{title}</div>
                <div className="window__top-bar__btn-list">
                    <div className="btn btn-close" onClick={onClose}>X</div>
                </div>
            </div>
            {children}
        </div>
    </Draggable>)
}
