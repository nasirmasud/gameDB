"use client";

import { CustomGameForm } from "./CustomGameForm";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function AddCustomGameModal({ onClose, onCreated }: Props) {
  return <CustomGameForm onClose={onClose} onSuccess={onCreated} />;
}
