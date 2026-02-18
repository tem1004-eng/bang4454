import React from 'react';

// FIX: Explicitly type `iconProps` to ensure properties like `strokeLinecap`
// are compatible with SVG attributes, preventing type inference to a generic `string`.
const iconProps: React.SVGProps<SVGSVGElement> = {
  className: "w-6 h-6",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const CursorIcon = () => (
    <svg {...iconProps}>
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
        <path d="M13 13l6 6"/>
    </svg>
);

export const PenIcon = () => (
  <svg {...iconProps}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const EraserIcon = () => (
  <svg {...iconProps}>
    <path d="M20.49 2.49a2.4 2.4 0 0 0-3.39 0L7.5 12.09l-4.24 4.24a2.4 2.4 0 0 0 0 3.39L6.65 23l12.12-12.12a2.4 2.4 0 0 0 0-3.39Z"/>
    <path d="m21 21-4-4"/>
  </svg>
);

export const SaveIcon = () => (
    <svg {...iconProps}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

export const LoadIcon = () => (
    <svg {...iconProps}>
        <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const ListIcon = () => (
    <svg {...iconProps}>
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);


export const PrintIcon = () => (
    <svg {...iconProps}>
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
);

export const EditCompleteIcon = () => (
    <svg {...iconProps}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export const PdfIcon = () => (
    <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <path d="M11.5 12H12a1.5 1.5 0 0 1 0 3h-1a1.5 1.5 0 0 0 0 3h.5"></path>
        <path d="M9 12h1a2 2 0 0 1 0 4H9v-4Z"></path>
        <path d="M16 12h1.5a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5H16v-3Z"></path>
    </svg>
);

export const NewFileIcon = () => (
    <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
);

export const MonitorIcon = () => (
    <svg {...iconProps}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
);

export const CloseIcon = () => (
    <svg {...iconProps}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);