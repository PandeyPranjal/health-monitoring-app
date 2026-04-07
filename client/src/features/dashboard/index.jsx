import { Card } from '../../components'
import { HeartPulseIcon, ActivityIcon, DropletIcon, MoonIcon } from '../../components/icons'

export default function DashboardPage() {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Hero card */}
      <Card
        variant="gradient"
        icon={<HeartPulseIcon className="w-5 h-5 text-white" />}
        iconBg="bg-white/20"
        title="Heart Rate"
        value="72 bpm"
        subtitle="Resting • Last updated 2 min ago"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          icon={<ActivityIcon className="w-4 h-4 text-accent" />}
          iconBg="bg-accent/10"
          title="Steps"
          value="8,432"
          trend="up"
          trendValue="+12%"
          subtitle="Goal: 10,000"
        />
        <Card
          icon={<DropletIcon className="w-4 h-4 text-blue-500" />}
          iconBg="bg-blue-500/10"
          title="SpO₂"
          value="98%"
          subtitle="Normal range"
        />
        <Card
          icon={<MoonIcon className="w-4 h-4 text-primary-light" />}
          iconBg="bg-primary-light/10"
          title="Sleep"
          value="7h 23m"
          trend="down"
          trendValue="-8%"
          subtitle="Last night"
        />
        <Card
          icon={<HeartPulseIcon className="w-4 h-4 text-danger" />}
          iconBg="bg-danger/10"
          title="Calories"
          value="1,847"
          trend="up"
          trendValue="+5%"
          subtitle="Burned today"
        />
      </div>
    </div>
  )
}
