import type { Metadata } from "next";
import { Gamepad2, Users, Award, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GameDB — the ultimate game discovery platform.",
};

const stats = [
  { label: "Games Cataloged", value: "100K+", icon: Gamepad2 },
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Expert Reviews", value: "5K+", icon: Award },
  { label: "Daily Updates", value: "500+", icon: TrendingUp },
];

const team = [
  { name: "Alex Chen", role: "Founder & Lead Developer", avatar: "AC" },
  { name: "Maria Lopez", role: "UI/UX Designer", avatar: "ML" },
  { name: "James Wilson", role: "Backend Engineer", avatar: "JW" },
  { name: "Priya Sharma", role: "Community Manager", avatar: "PS" },
];

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
      {/* Hero */}
      <section className='mb-16 text-center'>
        <h1 className='mb-4 text-4xl font-bold'>
          About <span className='text-primary'>GameDB</span>
        </h1>
        <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
          GameDB is your ultimate destination for discovering, reviewing, and tracking games across
          every platform. We bring together a massive catalog of titles, community-driven reviews,
          and personalized recommendations.
        </p>
      </section>

      {/* Mission */}
      <section className='mb-16'>
        <h2 className='mb-6 text-2xl font-bold'>Our Mission</h2>
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-xs border border-border bg-card p-6'>
            <h3 className='mb-2 text-lg font-semibold'>Discover Games</h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Browse over 100,000 games from every era and platform. Our powerful search and
              filter tools help you find exactly what you&apos;re looking for.
            </p>
          </div>
          <div className='rounded-xs border border-border bg-card p-6'>
            <h3 className='mb-2 text-lg font-semibold'>Share Your Voice</h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Rate and review games you&apos;ve played. Your opinions help the community discover
              hidden gems and avoid disappointments.
            </p>
          </div>
          <div className='rounded-xs border border-border bg-card p-6'>
            <h3 className='mb-2 text-lg font-semibold'>Track Your Library</h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Build your personal game collection. Add favorites, track what you&apos;ve played,
              and keep a wishlist of what you want to play next.
            </p>
          </div>
          <div className='rounded-xs border border-border bg-card p-6'>
            <h3 className='mb-2 text-lg font-semibold'>Community Driven</h3>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              Users can submit custom game entries, contribute reviews, and help grow the
              database. GameDB is built by gamers, for gamers.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className='mb-16'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-xs border border-border bg-card p-6 text-center'
            >
              <stat.icon className='mx-auto mb-2 h-6 w-6 text-primary' />
              <p className='text-2xl font-bold'>{stat.value}</p>
              <p className='text-xs text-muted-foreground'>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className='mb-16'>
        <h2 className='mb-6 text-2xl font-bold'>Meet the Team</h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {team.map((member) => (
            <div key={member.name} className='rounded-xs border border-border bg-card p-6 text-center'>
              <div className='mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground'>
                {member.avatar}
              </div>
              <h3 className='font-semibold'>{member.name}</h3>
              <p className='text-xs text-muted-foreground'>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className='text-center'>
        <h2 className='mb-3 text-2xl font-bold'>Want to get in touch?</h2>
        <p className='mb-6 text-muted-foreground'>
          We&apos;d love to hear from you. Reach out with questions, suggestions, or just to say hi.
        </p>
        <a
          href='/contact'
          className='inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90'
        >
          Contact Us
        </a>
      </section>
    </div>
  );
}
