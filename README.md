# JTrack

**Japanese Spaced Repetition Learning App**

JTrack is a comprehensive foreign-language learning application designed to help users master Japanese through a scientifically proven Spaced Repetition System (SRS). Built as a dissertation project, it combines a modern, responsive interface with robust progress tracking.

## 🚀 Features

-   **Spaced Repetition System (SRS)**: Implements the **SuperMemo2 algorithm** to optimize study intervals and maximize retention.
-   **Comprehensive Study Decks**:
    -   **Hiragana & Katakana**: Master the fundamental Japanese syllabaries.
    -   **Kanji**: Advanced character study (in progress).
-   **Progress Tracking**: Detailed statistics and visualizations of your learning journey.
-   **User Authentication**: Secure account creation and data synchronization.
-   **Interactive UI**: Smooth animations and intuitive design for an engaging study experience.

## 🛠️ Tech Stack

**Frontend**
-   **Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Styled Components](https://styled-components.com/)
-   **State Management**: [React Query](https://tanstack.com/query/latest)
-   **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)

**Backend**
-   **Platform**: [Supabase](https://supabase.com/)
-   **Database**: PostgreSQL
-   **Authentication**: Supabase Auth

**Testing**
-   **Unit/Integration**: [Vitest](https://vitest.dev/)
-   **Testing Library**: React Testing Library

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js** (v18 or higher recommended)
-   **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd jTrack_main
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You will need Supabase credentials to run the app fully.
    
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(See `DEPLOYMENT_PLAN.md` for detailed database schema setup if setting up a fresh Supabase project.)*

## 🖥️ Usage

**Start Development Server**
```bash
npm run dev
```
Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

**Build for Production**
```bash
npm run build
```
Builds the app for production to the `dist` folder.

**Preview Production Build**
```bash
npm run preview
```
Locally preview the production build.

## 🧪 Testing

Run the test suite to verify functionality.

```bash
npm test
```
To run tests with UI:
```bash
npm run test:ui
```

## 📂 Project Structure

-   `src/components`: Reusable UI components.
-   `src/server`: Backend/API related logic.
-   `src/styles`: Global styles and theme configurations.
-   `src/test`: Test configurations and setup.
-   `supabase`: Supabase related configurations.

## 🚢 Deployment

For full deployment instructions, including database schema and production configuration, please refer to [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md).

The app is ready to be deployed to platforms like **Vercel** or **Netlify**.

---
*Created by Shaurya Dey*
