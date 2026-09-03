"use client";

import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { BottomSheetModal } from "@/components/modals";
import { useAppSelector } from "@/store/hooks";
import { LocationModal } from "./location-modal";

export type LocationButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
};

export function LocationButton({
  children,
  onClick,
  type = "button",
  ...buttonProps
}: LocationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectionRevision = useAppSelector(
    (state) => state.location.selectionRevision,
  );
  const revisionWhenOpened = useRef(selectionRevision);

  useEffect(() => {
    if (isOpen && selectionRevision !== revisionWhenOpened.current) {
      setIsOpen(false);
    }
  }, [isOpen, selectionRevision]);

  return (
    <>
      <button
        {...buttonProps}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            revisionWhenOpened.current = selectionRevision;
            setIsOpen(true);
          }
        }}
      >
        {children}
      </button>

      <BottomSheetModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose your location"
        description="Select a location to discover services near you."
        closeLabel="Close location picker"
      >
        <LocationModal />
      </BottomSheetModal>
    </>
  );
}

export default LocationButton;
