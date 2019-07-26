import { VO, httpRequest } from "./HttpRequest";

export interface INotificationApi {
    // 取得通知消息
    getNotifications(lastIndex: number, size?: number): Promise<NotificationVO[]>;

    // 发送通知消息（供其他接口调用）
    sendNotification(notification: NotificationDTO): Promise<void>;
}

class NotificationApi implements INotificationApi {
    async getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
        return await httpRequest.callFunction<NotificationVO[]>("getNotifications", { lastIndex, size });
    }

    async sendNotification(notification: NotificationDTO): Promise<void> {
        return await httpRequest.callFunction<void>("sendNotification", { notification });
    }
}

class MockNotificationApi implements INotificationApi {
    getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
        throw new Error("Method not implemented.");
    }
    sendNotification(notification: NotificationDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

let notificationApi: INotificationApi = new NotificationApi();
let mockNotificationApi: INotificationApi = new MockNotificationApi();
export { notificationApi, mockNotificationApi }

export interface NotificationDTO {
    userID: string;
    content: string;
}

export interface NotificationVO extends VO {
    userID: string;
    content: string;
    time: number;
}