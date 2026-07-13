"use client";

import { useState, type FormEvent } from "react";
import { Mail, MapPin, Clock, Send } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@gamedb.com",
    href: "mailto:support@gamedb.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "123 Gaming Street, Playville, GP 10001",
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "Within 24 hours",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email, and message are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className='mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4'>
        <div className='rounded-xs border border-border bg-card p-10 text-center'>
          <Send className='mx-auto mb-4 h-10 w-10 text-primary' />
          <h1 className='mb-2 text-2xl font-bold'>Message Sent!</h1>
          <p className='text-muted-foreground'>
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className='mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90'
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mb-10 text-center'>
        <h1 className='mb-3 text-4xl font-bold'>Contact Us</h1>
        <p className='text-lg text-muted-foreground'>
          Have a question, suggestion, or just want to say hi? We&apos;d love to hear from you.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-[1fr_320px]'>
        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
              placeholder='Your name'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Subject</label>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
              placeholder='How can we help?'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
              placeholder='Tell us more about your inquiry...'
            />
          </div>

          {error && <p className='text-sm text-red-400'>{error}</p>}

          <button
            type='submit'
            className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90'
          >
            <Send className='h-4 w-4' /> Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className='space-y-4'>
          {contactInfo.map((item) => (
            <div key={item.label} className='rounded-xs border border-border bg-card p-5'>
              <div className='mb-2 flex items-center gap-2 text-primary'>
                <item.icon className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-wide'>
                  {item.label}
                </span>
              </div>
              {item.href ? (
                <a
                  href={item.href}
                  className='text-sm font-medium hover:text-primary hover:underline'
                >
                  {item.value}
                </a>
              ) : (
                <p className='text-sm font-medium'>{item.value}</p>
              )}
            </div>
          ))}

          <div className='rounded-xs border border-border bg-card p-5'>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Follow Us
            </p>
            <div className='flex gap-3 text-sm'>
              <a href='#' className='text-muted-foreground hover:text-primary hover:underline'>
                Twitter
              </a>
              <a href='#' className='text-muted-foreground hover:text-primary hover:underline'>
                Discord
              </a>
              <a href='#' className='text-muted-foreground hover:text-primary hover:underline'>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
