import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className='bg-background border-t border-border text-muted-foreground'>
      <div className='w-full px-8 py-14 md:px-12 lg:px-16'>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]'>
          {/* Brand */}
          <div>
            <div className='flex items-center gap-2'>
              <span className='text-xl'>🎮</span>
              <span className='text-lg font-semibold text-foreground'>
                GameDB
              </span>
            </div>
            <p className='mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground'>
              Your ultimate gaming database. Discover, track, and explore the
              best games.
            </p>
            <div className='mt-5 flex items-center gap-4'>
              <a
                href='#'
                aria-label='Discord'
                className='hover:text-foreground transition-colors'
              >
                <FaDiscord className='h-4 w-4' />
              </a>
              <a
                href='#'
                aria-label='Twitter'
                className='hover:text-foreground transition-colors'
              >
                <FaTwitter className='h-4 w-4' />
              </a>
              <a
                href='#'
                aria-label='Instagram'
                className='hover:text-foreground transition-colors'
              >
                <FaInstagram className='h-4 w-4' />
              </a>
              <a
                href='#'
                aria-label='YouTube'
                className='hover:text-foreground transition-colors'
              >
                <FaYoutube className='h-4 w-4' />
              </a>
            </div>
          </div>

          {/* Discover */}
          <FooterColumn
            title='Discover'
            links={["Games", "Genres", "Platforms", "Top Rated", "Upcoming"]}
          />

          {/* Community */}
          <FooterColumn
            title='Community'
            links={["Reviews", "News", "Forums", "Blog", "Creators"]}
          />

          {/* Support */}
          <FooterColumn
            title='Support'
            links={[
              "Help Center",
              "Contact Us",
              "Feedback",
              "Terms of Service",
              "Privacy Policy",
            ]}
          />

          {/* Newsletter */}
          <div>
            <h4 className='text-sm font-semibold text-foreground'>
              Stay in the loop
            </h4>
            <p className='mt-3 text-sm text-muted-foreground'>
              Get the latest game news and updates.
            </p>
            <form className='mt-4 flex items-center gap-2'>
              <input
                type='email'
                required
                placeholder='Enter your email'
                className='w-full rounded-full border border-input bg-secondary/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/50'
              />
              <button
                type='submit'
                className='shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors'
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className='text-sm font-semibold text-foreground'>{title}</h4>
      <ul className='mt-3 space-y-2.5'>
        {links.map((link) => (
          <li key={link}>
            <a
              href='#'
              className='text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
