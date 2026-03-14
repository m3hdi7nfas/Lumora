export const defaultSiteContent = {
    hero: {
        badge: "Established in 2024",
        title_prefix: "Elevate Your ",
        title_highlight: "Learning Journey",
        description: "Join thousands of students in STEM competitions and quizzes. Earn points, badges, and climb the leaderboards.",
        cta_primary: "Get Started",
        cta_secondary: "How It Works",
        stats: {
            students: "35K+",
            competitions: "25+",
            questions: "7+",
            schools: "70+"
        }
    },
    features: [
        {
            title: 'Competitions',
            description: 'Participate in seasonal competitions with your school and compete against others. Expected prizes for top performers!',
            icon: 'Trophy'
        },
        {
            title: 'School Leaderboards',
            description: 'See how your school ranks against others and push for the top spot together.',
            icon: 'Users'
        },
        {
            title: 'Practice Mode',
            description: 'Sharpen your skills with unlimited practice questions outside of competitions.',
            icon: 'Target'
        },
        {
            title: 'Badges & Achievements',
            description: 'Earn badges for milestones and show off your accomplishments.',
            icon: 'Award'
        },
        {
            title: '1v1 Challenges',
            description: 'Challenge your friends to head-to-head battles and prove your knowledge.',
            icon: 'Swords'
        },
        {
            title: 'Diverse Topics',
            description: 'Questions spanning multiple subjects curated by educators.',
            icon: 'BookOpen'
        }
    ]
};

export type SiteContent = typeof defaultSiteContent;