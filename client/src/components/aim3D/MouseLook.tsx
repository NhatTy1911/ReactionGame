import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { DEFAULT_SENSITIVITY, type LookState } from "../../utils/lookMath";
import { attachPointerLockLook, type LookSettings } from "../../utils/pointerLockLook";

interface MouseLookProps {
    /** id của phần tử sẽ được pointer lock (mặc định là khung arena). */
    lockElementId?: string;
    sensitivity?: number;
}

/**
 * Mouse look raw 1:1: góc camera được cập nhật ngay trong event chuột,
 * không lerp, không phụ thuộc React state nên không có độ trễ thêm.
 */
export default function MouseLook({
    lockElementId = "fps-arena",
    sensitivity = DEFAULT_SENSITIVITY,
}: MouseLookProps) {
    // `get` là hàm đọc state hiện tại của R3F; lấy camera bên trong effect
    // để lint không coi đây là sửa giá trị của hook sau khi render.
    const get = useThree((state) => state.get);
    const settings = useRef<LookSettings>({ sensitivity });

    useEffect(() => {
        settings.current.sensitivity = sensitivity;
    }, [sensitivity]);

    useEffect(() => {
        const arena = document.getElementById(lockElementId);

        if (!arena) return;

        const camera = get().camera;

        camera.rotation.order = "YXZ";

        const look: LookState = {
            yaw: camera.rotation.y,
            pitch: camera.rotation.x,
        };

        return attachPointerLockLook({
            element: arena,
            state: look,
            settings: settings.current,
            onLook: ({ yaw, pitch }) => {
                camera.rotation.set(pitch, yaw, 0);
            },
            onLockChange: (locked) => {
                arena.classList.toggle("is-locked", locked);
            },
        });
    }, [get, lockElementId]);

    return null;
}
