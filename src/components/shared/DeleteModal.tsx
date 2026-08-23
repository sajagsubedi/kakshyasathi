import { LoaderCircle, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface DeleteModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
    title?: string;
}

const DeleteModal = ({
    isOpen,
    message,
    onCancel,
    onConfirm,
    isDeleting,
    title = "Delete Confirmation",
}: DeleteModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isDeleting) {
                    onCancel();
                }
            }}
        >
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h2
                        id="delete-modal-title"
                        className="text-lg font-semibold tracking-tight"
                    >
                        {title}
                    </h2>

                    <p
                        id="delete-modal-description"
                        className="mt-2 text-sm leading-6 text-muted-foreground"
                    >
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="w-full sm:w-auto"
                    >
                        {isDeleting ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;