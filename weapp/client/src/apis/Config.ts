import { db } from "./HttpRequest";
import "@tarojs/async-await";

/**
 * 全局小程序内容的配置
 * 在云数据库里放一份，本地远端同步
 */
export class ConfigApi {
    private config: {[key: string]: any} = {};
    constructor() {
        this.initToDefault();
        this.syncFromCloud();
    }

    /**
     * 初始化成 默认数据
     */
    private initToDefault() {
        this.config = Object
            .values(ConfigItem)
            .reduce((pre, cur) => ({
                ...pre,
                [cur.key]: cur.default
            }), {});
    }

    /**
     * 与云端同步
     */
    public async syncFromCloud() {
        const PERIOD = 60 * 1000;
        try {
            const configCollection = db.collection("config");
            const result = await configCollection.limit(1).get();
            const config = result.data[0];
            this.config = {
                ...this.config,
                ...config
            }
        } catch (error) {
            console.error("同步云端配置失败", error);
            // 一分钟后重试
            setTimeout(() => {
                this.syncFromCloud();
            }, PERIOD);
        }
    }

    /**
     * 获取所有配置
     */
    public getAllConfigs() {
        return {
            ...this.config
        };
    }

    public getConfig(item: IConfigItem) {
        return this.config[item.key] || item.default;
    }
}

interface IConfigItem {
    key: string;
    default: any;
}
export const ConfigItem = {
    APP_NAME: {
        key: "app-name",
        default: "蓝鲸小书童"
    },
    COMPANY_NAME: {
        key: "company-name",
        default: "敦枢电子商务有限责任公司"
    },
    EMAIL: {
        key: "email",
        default: "18852082801@163.com"
    },
    PHONE: {
        key: "phone",
        default: "13390758334"
    },
    SOCKET_ADDRESS: {
        key: "socker-address",
        default: ""
    },// 聊天socket的连接地址
    DEVELOPER: {
        key: "developer",
        default: {
            team: "文向东开发团队",
            email: "wenxiangdong@outlook.com",
            members: ["李培林", "陈思彤", "张李承"]
        }
    },// 开发者信息
    PLATFORM_RULES: {
        key: "platform-rules",
        default: ['本平台仅为南京大学校内师生服务，谨遵诚信原则']
    },
    PRIVATE_POLICY: {
        key: "private-policy",
        default: ["本程序承诺保护用户隐私及数据，不会用于其他商业用途"]
    },
    LOGO: {
        key: "logo",
        default: "cloud://dev-mecmb.6465-dev-mecmb/logo.jpg"
    },
  ACTIVITY_PICTURES: {
      key: "activity-pictures",
    default: []
  },  // 首页轮播图
}

const configApi = new ConfigApi();
export default configApi;
