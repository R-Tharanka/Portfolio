import * as React from "react";

type TabsProps = {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
};

export const Tabs: React.FC<TabsProps> = ({ defaultValue, className = "", children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  // Clone children and inject the active tab state
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TabsList || child.type === TabsContent) {
        return React.cloneElement(child as React.ReactElement<any>, {
          activeTab,
          setActiveTab,
        });
      }
    }
    return child;
  });

  return (
    <div className={`tabs ${className}`}>
      {childrenWithProps}
    </div>
  );
};

type TabsListProps = {
  className?: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
};

export const TabsList: React.FC<TabsListProps> = ({ 
  className = "", 
  children,
  activeTab,
  setActiveTab 
}) => {
  // Clone children and inject the active tab state
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === TabsTrigger) {
      return React.cloneElement(child as React.ReactElement<any>, {
        activeTab,
        setActiveTab,
      });
    }
    return child;
  });

  return (
    <div className={`inline-flex p-1 bg-card rounded-lg ${className}`}>
      {childrenWithProps}
    </div>
  );
};

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children,
  activeTab,
  setActiveTab,
  className = ""
}) => {
  const isActive = activeTab === value;
  
  const handleClick = () => {
    if (setActiveTab) {
      setActiveTab(value);
    }
  };

  return (
    <button
      className={`px-3 py-1.5 text-sm font-medium transition-all ${
        isActive 
          ? "bg-background text-foreground shadow-sm" 
          : "text-foreground/60 hover:text-foreground/80"
      } rounded-md ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  className?: string;
};

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children,
  activeTab,
  className = ""
}) => {
  const isActive = activeTab === value;
  
  if (!isActive) return null;
  
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
};
