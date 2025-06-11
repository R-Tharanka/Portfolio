import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DocumentPortalProps {
    children: React.ReactNode;
    rootId?: string;
}

/**
 * A component that renders its children at the document root level,
 * outside any stacking contexts, ensuring elements like toasts and modals
 * can always appear on top of other content.
 */
const DocumentPortal: React.FC<DocumentPortalProps> = ({
    children,
    rootId = 'portal-root'
}) => {
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Check if portal root already exists
        let root = document.getElementById(rootId);

        // Create it if it doesn't exist
        if (!root) {
            root = document.createElement('div');
            root.id = rootId;
            root.style.position = 'fixed';
            root.style.top = '0';
            root.style.left = '0';
            root.style.width = '100%';
            root.style.height = '0';
            root.style.overflow = 'visible';
            root.style.zIndex = '10000'; // Highest z-index
            document.body.appendChild(root);
        }

        setPortalRoot(root);

        // Clean up function
        return () => {
            // Only remove the portal root if it's empty
            if (root && root.childNodes.length === 0) {
                document.body.removeChild(root);
            }
        };
    }, [rootId]);

    // Only create the portal if the portal root exists
    if (!portalRoot) return null;

    return createPortal(children, portalRoot);
};

export default DocumentPortal;
