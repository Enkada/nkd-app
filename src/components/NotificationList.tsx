import { formatText } from "../Utils"

export const NotificationList = ({
    notifications
}: {
    notifications: string[]
}) => {
    return (
        <div className="notification-list">
            {notifications.map((notification, index) => (
                <div key={index} className="notification-wrapper">
                    <div className="notification" dangerouslySetInnerHTML={{ __html: formatText(notification) }}></div>
                </div>
            ))}
        </div>
    )
}
