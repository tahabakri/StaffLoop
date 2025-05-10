# **🎨 StaffLoop – Frontend Guidelines Document**

---

## **🔧 1\. Framework & Setup**

* **Framework**: React.js (Web) \+ React Native with Expo (Mobile)

**Project Structure**: Feature-based folder structure

 bash  
CopyEdit  
`/src`  
  `/components`  
  `/pages`  
  `/hooks`  
  `/utils`  
  `/services`  
  `/assets`  
  `/context`

*   
* **Package Manager**: Yarn or npm (prefer Yarn for consistency)

---

## **🧱 2\. UI Design & Styling**

* **Styling System**: Tailwind CSS (Web) / NativeWind (Mobile)

* **Design Tokens**:

  * Font: `Inter`, `Sans-serif`

  * Colors:

    * Primary: `#1A73E8`

    * Accent: `#00C6AE`

    * Gray: `#F5F5F5`, `#E0E0E0`

  * Radius: `rounded-2xl`

  * Shadow: `shadow-md`

* **Component Guidelines**:

  * Use **Shadcn/ui** components for consistency (Web)

  * Reuse small building blocks (e.g., `Button`, `Card`, `Input`, etc.)

  * Avoid inline styles; rely on Tailwind for visual consistency

---

## **📱 3\. Mobile UI (Expo)**

* Use **NativeWind** for styling (Tailwind in React Native)

* Modularize screens (`/screens`, `/components`)

* Use `react-navigation` for routing

* Always wrap components with `SafeAreaView`

---

## **📐 4\. Responsiveness & Layouts**

* Use **Flexbox** for layout

* Use `max-w-7xl mx-auto px-4` for consistent spacing

* Prioritize **mobile-first design**

---

## **🔁 5\. Reusable Components**

* Build and store shared components inside `/components`:

  * Button, Modal, Table, Avatar, Badge, Navbar, Footer

* Keep components **stateless** and receive all data via props

* Use **hooks** for logic (e.g., `useCheckIn()`, `useStaffList()`)

---

## **🧩 6\. State Management**

* Start with **Zustand** for global lightweight state

* Use React Context if needed (e.g., AuthContext)

* Avoid prop drilling

---

## **🧼 7\. Code Quality**

* Use ESLint \+ Prettier with Airbnb config

* Follow naming conventions:

  * Components: `PascalCase`

  * Files: `kebab-case.js`

* Commit format: `feat:`, `fix:`, `refactor:`, `style:`, etc.

---

## **🧪 8\. Testing (Optional in Early MVP)**

* Use **Jest** and **React Testing Library** (later phase)

* Write basic unit tests for core components and logic

---

## **🧭 9\. Navigation**

* Web: Use `react-router-dom` for routing

* Mobile: Use `@react-navigation/native` with stacks and tabs

---

## **🔗 10\. External Packages**

| Purpose | Library |
| ----- | ----- |
| UI Components | shadcn/ui (Web), NativeBase |
| Icons | Lucide, Heroicons |
| Forms | React Hook Form \+ Zod |
| Data Fetching | Axios or React Query |
| CSV Parsing | PapaParse |
| Face ID | FaceIO / TensorFlow.js |
| Maps & Location | Expo-location / Leaflet |

