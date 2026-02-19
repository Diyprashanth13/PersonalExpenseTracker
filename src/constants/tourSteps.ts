
export interface TourStep {
    id: number;
    target: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
    {
        id: 1,
        target: "#dashboard-summary",
        title: "Total Balance",
        description: "Your overall financial health at a glance. See your total savings and monthly performance here.",
        position: 'bottom'
    },
    {
        id: 2,
        target: "#reports-section",
        title: "Visual Analytics",
        description: "Understand where your money goes with these interactive charts and distributions.",
        position: 'top'
    },
    {
        id: 3,
        target: "#transactions-list",
        title: "Recent Activity",
        description: "Track your latest transactions here. Keeping a daily log is the best way to save!",
        position: 'top'
    },
    {
        id: 4,
        target: "#add-transaction-button-mobile, #add-transaction-button-desktop",
        title: "Add New Record",
        description: "Got coffee? Paid rent? Add it instantly by clicking this button. Fast and easy!",
        position: 'left'
    },
    {
        id: 5,
        target: "#nav-history-mobile, #nav-history-desktop",
        title: "Full History",
        description: "Access your complete historical records. You can search, filter, and edit any previous transaction.",
        position: 'top'
    },
    {
        id: 6,
        target: "#nav-insights-mobile, #nav-insights-desktop",
        title: "Deep Insights",
        description: "Get smart summaries and category-wise spending patterns to optimize your budget.",
        position: 'top'
    },
    {
        id: 7,
        target: "#settings-button-mobile, #settings-button-desktop",
        title: "Personalize",
        description: "Change themes, manage custom categories, and export your data as CSV for accounting.",
        position: 'top'
    },
    {
        id: 8,
        target: "#sync-indicator",
        title: "Secure & Cloud Synced",
        description: "Your data is automatically synced to the cloud. You can use FinTrack offline; it will sync once you're back online!",
        position: 'bottom'
    }
];
