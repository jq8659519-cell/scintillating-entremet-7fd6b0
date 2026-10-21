import { db } from './localDB'
import { KEYS, type Course, type User } from './schema'
import { hashPassword } from './services'

export const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'student@learnly.dev', password: 'student123' },
  { label: 'Admin', email: 'admin@learnly.dev', password: 'admin123' },
]

const courses: Course[] = [
  {
    id: 'course-web-basics',
    title: 'Web Development Foundations',
    description: 'Understand how the web works, from HTML structure to styling and interactivity.',
    pointsPerLesson: 20,
    lessons: [
      { id: 'wb-1', title: 'How the Web Works', content: 'Browsers request documents from servers over HTTP. The server responds with HTML, CSS and JavaScript that the browser parses, lays out and paints on screen.\n\nKey ideas: client vs. server, URLs, request/response, status codes.' },
      { id: 'wb-2', title: 'Semantic HTML', content: 'HTML describes the meaning of content. Use elements like header, main, nav, article and footer so browsers, search engines and assistive technology understand your page.\n\nTip: a button should be a <button>, not a clickable <div>.' },
      { id: 'wb-3', title: 'Styling with CSS', content: 'CSS controls presentation. Learn the cascade, specificity, the box model and modern layout with Flexbox and Grid.\n\nUtility frameworks like Tailwind CSS let you compose styles directly in markup.' },
      { id: 'wb-4', title: 'JavaScript Essentials', content: 'JavaScript adds behavior: responding to events, updating the DOM and fetching data. Master variables, functions, arrays, objects and async/await.' },
    ],
  },
  {
    id: 'course-react',
    title: 'React with TypeScript',
    description: 'Build type-safe, component-driven user interfaces with React and TypeScript.',
    pointsPerLesson: 30,
    lessons: [
      { id: 'rt-1', title: 'Components & Props', content: 'Components are functions that return UI. Props are their typed inputs.\n\ninterface ButtonProps { label: string }\nfunction Button({ label }: ButtonProps) { return <button>{label}</button> }' },
      { id: 'rt-2', title: 'State & Events', content: 'useState stores values that change over time. When state updates, React re-renders the component with the new value.' },
      { id: 'rt-3', title: 'Routing with React Router', content: 'React Router maps URLs to components. Nested routes and <Outlet /> let layouts wrap pages, and <Navigate /> handles redirects such as protected routes.' },
    ],
  },
  {
    id: 'course-money',
    title: 'Personal Finance 101',
    description: 'Budgeting, saving and investing basics to build healthy money habits.',
    pointsPerLesson: 15,
    lessons: [
      { id: 'pf-1', title: 'Building a Budget', content: 'Track income and expenses for a month. A simple rule of thumb is 50% needs, 30% wants and 20% savings.' },
      { id: 'pf-2', title: 'Emergency Funds', content: 'Aim to save three to six months of essential expenses in an easily accessible account before investing.' },
      { id: 'pf-3', title: 'Intro to Investing', content: 'Investing grows wealth over time through compounding. Diversified, low-cost index funds are a common starting point.' },
    ],
  },
]

export async function seedDatabase() {
  if (db.isSeeded()) return
  const now = new Date().toISOString()
  const [studentHash, adminHash] = await Promise.all([
    hashPassword(DEMO_ACCOUNTS[0].password),
    hashPassword(DEMO_ACCOUNTS[1].password),
  ])
  const users: User[] = [
    { id: 'user-demo', name: 'Demo Student', email: DEMO_ACCOUNTS[0].email, passwordHash: studentHash, role: 'user', points: 750, referralCode: 'LEARN26', createdAt: now },
    { id: 'user-admin', name: 'Site Admin', email: DEMO_ACCOUNTS[1].email, passwordHash: adminHash, role: 'admin', points: 0, referralCode: 'ADMIN1', createdAt: now },
  ]
  db.save(KEYS.courses, courses)
  db.save(KEYS.progress, [])
  db.save(KEYS.withdrawals, [])
  db.save(KEYS.transactions, [
    { id: 'tx-seed', userId: 'user-demo', amount: 750, type: 'admin', note: 'Starter balance', createdAt: now },
  ])
  db.save(KEYS.users, users)
}
