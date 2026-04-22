/**
 * Generic fallback when role is neither staff nor a known member type.
 * Prefer routing from `/_authenticated/index` to individual vs organization homes.
 */
import IndividualDashboardHome from './individual-dashboard-home'

export default function DashboardHomepage() {
  return <IndividualDashboardHome />
}
