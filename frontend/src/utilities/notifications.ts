import { ref, watch } from 'vue';
import { fetch } from './api';
import { computed } from '@vue/reactivity';

//@TODO: complete null unions if missing
export type Notification = {
    id: number;
    level: 'info'; //@TODO: add other levels
    recepient: number;
    unread: boolean;
    actor_content_type: number;
    actor_object_id: string;
    verb: string;
    description: string | null;
    timestamp: string;
    public: boolean;
    deleted: boolean;
    emailed: boolean;
    important: boolean;
    actor: string;
    action_object: string;
    action_object_url: string;
    custom_text?: string;
    target?: string;
};

export const notifications = (function () {
    const notificationsRef = ref<Notification[]>([]);

    const refresh = async () => {
        const res = await fetch('/notification/all');
        const json = await res.json();
        notificationsRef.value = json['notifications'];
    };

    refresh();

    return {
        notificationsRef,
        markRead: async (id: number) => {
            const res = await fetch('/notification/mark_as_read/' + id, { method: 'POST' });
            notificationsRef.value = (await res.json())['notifications'];
        },
        markAllRead: async () => {
            const res = await fetch('/notification/mark_as_read', { method: 'POST' });
            notificationsRef.value = (await res.json())['notifications'];
        }
    };
})();

export const pushNotifications = (function () {
    const pushNotificationsStatus = ref({
        supported: false,
        enabled: null
    });

    function getPublicKey() {
        return document.querySelector<HTMLMetaElement>('meta[name="django-webpush-vapid-key"]')
            .content;
    }

    function urlB64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const subscribeOpts = {
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(getPublicKey())
    };

    async function getSubscription() {
        if (!reg) {
            return null;
        }

        try {
            let sub = await reg.pushManager.getSubscription();
            if (sub) {
                return sub;
            }

            sub = await reg.pushManager.subscribe(subscribeOpts);

            const browser = navigator.userAgent
                .match(/(firefox|msie|chrome|safari|trident)/gi)[0]
                .toLowerCase();
            const data = {
                status_type: 'subscribe',
                subscription: sub.toJSON(),
                browser: browser,
                group: null
            };

            await fetch('/webpush/save_information', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return sub;
        } catch (exception) {
            console.log(exception);
        }

        return null;
    }

    async function subscribePushNotifications() {
        const isEnabled = (await getSubscription()) !== null;
        pushNotificationsStatus.value.enabled = isEnabled;
        return isEnabled;
    }

    let reg: null | ServiceWorkerRegistration = null;
    if ('serviceWorker' in navigator && 'PushManager' in window && getPublicKey()) {
        (async () => {
            try {
                reg = await navigator.serviceWorker.register('/static/service-worker.js');
                if (!reg.showNotification) {
                    return;
                }
                pushNotificationsStatus.value.supported = true;
                subscribePushNotifications();
            } catch (err) {
                console.log(err);
            }
        })();
    }

    return {
        ref: pushNotificationsStatus,
        subscribePushNotifications
    };
})();

export const notificationsCount = computed(
    () => notifications.notificationsRef.value.filter((n) => n.unread).length
);
export const importantNotificationsCount = computed(
    () => notifications.notificationsRef.value.filter((n) => n.important && n.unread).length
);
