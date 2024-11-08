import { isRef, readonly, ref, watch, type Ref } from 'vue';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Get data from API
 *
 * @param url url to fetch
 * @param data data which will be sent to the API
 * @param method HTTP method, if you want to override the default GET/POST
 * @note If data is passed, the request will be a POST request, otherwise a GET request, if not overridden by method parameter
 *
 * @returns $ReturnType, if the request was successful, otherwise undefined
 */
export const getFromAPI = async <$ReturnType>(
    url: string,
    data?: unknown,
    method?: Method
): Promise<$ReturnType | undefined> => {
    try {
        const response = await fetch(url, {
            method: method || (data ? 'POST' : 'GET'),
            body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
            return undefined;
        }

        const json = await response.json();
        return json as $ReturnType;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

/**
 * Generate array with range of numbers from start
 *
 * @param size size of the array
 * @param start starting number
 *
 * @returns array of numbers from start to start + size
 */
export const generateRange = (size: number, start = 0) => {
    return Array.from({ length: size }).map((_, i) => i + start);
};

const localStorageStores: Record<
    string,
    Omit<ReturnType<typeof refToStore<unknown>>, 'update'>
> = {};

/**
 * Returns object containing update and set function (see {@link refToStorage()}, which can modify value synced with localStorage
 *
 * @param key Key of localStorage item
 * @param initialValue Initial value of item
 * @returns Object, with set of functions: subscribe and set see {@link refToStore()}.
 * Only difference is, that set function will also update value in localStorage.
 */
export const localStorageStore = <$Type>(key: string, initialValue: $Type) => {
    if (!(key in localStorageStores)) {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                initialValue = JSON.parse(saved);
            } catch (exception) {
                console.log(`Failed to load ${key}: ${exception}`);
            }
        }

        const { subscribe, set, ref } = refToStore(initialValue);

        localStorageStores[key] = {
            ref,
            subscribe,
            set(value: $Type) {
                localStorage.setItem(key, JSON.stringify(value));
                set(value);
            }
        };
    }
    return localStorageStores[key];
};

/**
 * Type for callback used in subscribe function returned in refToStore
 */
type SubscribeCallback<$Type> = (value: $Type) => Promise<void> | void;

/**
 * Type fo callback used in update function returned in refToStore
 */
type UpdateCallback<$Type> = (value: $Type) => $Type;

/**
 * Create pair of three functions: subscribe, set, update.
 * These function coresponds to Svelte's Writable store functions.
 * - value is getter to get readonly proxy to reference
 * - Subscribe function will get callback, which will be called whenever ref value will change.
 * - Set function will get value and update value inside ref.
 * - Update function will get callback, which will get called with current value and callback can mutate it and return.
 * This returned value will be then set.
 *
 * @param refOrValue Reference of value which should be default value for reference
 * @returns Object containing subscribe and set function
 */
export const refToStore = <$RefType>(refOrValue: Ref<$RefType> | $RefType) => {
    let reference: Ref<$RefType>;
    if (isRef(refOrValue)) reference = refOrValue;
    else reference = ref(refOrValue) as Ref<$RefType>;

    return {
        get ref() {
            return readonly(reference);
        },
        subscribe: (callback: SubscribeCallback<$RefType>) => {
            watch(reference, callback);
        },
        set: (value: $RefType) => {
            reference.value = value;
        },
        update: (callback: UpdateCallback<$RefType>) => {
            reference.value = callback(reference.value);
        }
    };
};

export const derived = <$StoreType, $DerivedType>(
    storeLike: { subscribe: (callback: SubscribeCallback<$StoreType>) => void },
    modify: (value: $StoreType) => $DerivedType
) => {
    const internalRef = ref<$DerivedType>();
    const store = refToStore(internalRef);

    storeLike.subscribe(async (value) => {
        store.set(modify(value));
    });

    return store;
};
