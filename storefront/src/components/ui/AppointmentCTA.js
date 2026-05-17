import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

export default function AppointmentCTA() {
  return (
    <section className="section">
      <div className="bg-ink-900 rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,4 76,24 76,68 40,88 4,68 4,24' fill='none' stroke='%23c9a84c' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'80px 92px' }}/>
        <div className="relative z-10">
          <div className="flex justify-center gap-2 mb-6">
            <span className="badge badge-gold">Boutique Experience</span>
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl text-white mb-4">Visit Our Boutique</h2>
          <p className="text-ink-400 text-lg mb-8 max-w-xl mx-auto">
            Schedule a private appointment with our gemologists. View certified diamonds in person, design custom jewellery, or get expert advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/appointment" className="btn-gold px-8 py-4">
              <Calendar size={16}/> Book Appointment
            </Link>
            <Link href="/about#locations" className="btn-outline-gold px-8 py-4 border-white text-white hover:bg-white hover:text-ink-800">
              <MapPin size={16}/> Our Locations
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
