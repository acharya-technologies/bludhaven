# 🦇 BLUDHAVEN

**Tactical project management for solo operators. Track missions, manage payments, and dominate your workflow.**

### [Live Demo](https://bludhaven.vercel.app/) | [GitHub](https://github.com/acharya-technologies/bludhaven)

---

## 🚦 Features

### Mission Control
- Track projects from initial enquiry to final delivery with military precision.
- Real-time status updates and progress tracking.

### Financial Arsenal
- Secure payment tracking with installment planning and revenue protection.
- Visualize revenue, pending payments, and financial health.

### Workflow Automation
- Streamlined processes that adapt to your unique operational style.
- Automated status, reminders, and project updates.

### Advanced Analytics
- Deep insights into project performance and financial metrics.
- Charts for project status, priorities, and revenue.

### Client Management
- Complete client profiles with communication and project tracking.
- Contact info, project history, and status at a glance.

### Secure Vault
- End-to-end encryption ensures your data remains for your eyes only.
- Sensitive actions and financials protected by operator authorization.

---

## 🕵️‍♂️ Solo Operator Dashboard

- **Real-time Intel:** Live updates via Supabase subscriptions—no manual refresh needed.
- **Encrypted Data:** All sensitive data is encrypted and access-controlled.
- **Fast Execution:** Optimized for speed and reliability.
- **Exclusive Access:** Only authenticated operators can access the command center.

---

## 📊 Performance

| Metric         | Value    |
| -------------- | -------- |
| Uptime         | 100%     |
| Monitoring     | 24/7     |
| Encryption     | AES-256  |
| Response Time  | <100ms   |
| Data Loss      | Zero     |
| Operators      | 1        |

---

## 📁 Directory Structure

```
app/
  globals.css           # Global styles (Tailwind CSS)
  layout.tsx            # Root layout
  page.tsx              # Landing page
  auth/
    login/
      page.tsx          # Login page (Supabase auth)
  dashboard/
    page.tsx            # Main dashboard (stats, charts, revenue)
  projects/
    page.tsx            # Projects list, search, create
    [id]/
      page.tsx          # Project detail, edit, installments
```

---

## 🛡️ Security

- **Operator Authorization:** Sensitive actions (edit, delete, view financials) require a passphrase.
- **Supabase Auth:** All data is user-specific and protected.
- **End-to-End Encryption:** Your mission data is for your eyes only.

---

## 🚀 Getting Started

1. **Clone the repo**
   ```sh
   git clone https://github.com/acharya-technologies/bludhaven.git
   cd bludhaven
   ```

2. **Install dependencies**
   ```sh
   pnpm install
   ```

3. **Configure environment**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the app**
   ```sh
   pnpm dev
   ```

5. **Open in browser**
   ```sh
   $BROWSER http://localhost:3000
   ```

---

## 👤 Description

> **When existing tools failed to meet the demands of precision project management, we built our own arsenal.**  
> This isn't just another project management tool. It's a weapon designed for operators who refuse to compromise.

---

### Build with 🩸 by [Jason Todd](https://1ndrajeet.is-a.dev/)