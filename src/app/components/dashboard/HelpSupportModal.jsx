import { useState } from 'react';
import { X, Send, Mail, User, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function HelpSupportModal({ isOpen, onClose }) {
    const { currentTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const primaryColor = currentTheme?.colors?.primary || '#ec4899';

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // 1. Save to Supabase (Database)
            const { data: { user } } = await import('@/lib/supabase').then(m => m.supabase.auth.getUser());
            
            const ticketData = {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                user_id: user ? user.id : null
            };

            const { createSupportTicket } = await import('@/lib/api');
            const { error: dbError } = await createSupportTicket(ticketData);

            if (dbError) {
                console.error("Database Error:", dbError);
                throw new Error("Failed to save message to database.");
            }

            // 2. Call Edge Function (Supabase)
            try {
                const { error: fnError } = await import('@/lib/supabase').then(m => 
                    m.supabase.functions.invoke('send-support-email', {
                        body: ticketData
                    })
                );
                if (fnError) console.warn("Email Function Error:", fnError);
            } catch (fnErr) {
                 console.warn("Failed to invoke edge function", fnErr);
            }

            setSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            console.error(err);
            setError("Error sending message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-70 flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)', border: '1px solid var(--card-border)' }}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                    <h2 className="text-xl font-bold">Help & Support</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/10 active:scale-95 transition-transform">
                        <X className="w-6 h-6 opacity-70" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto pb-10 md:pb-6">
                    {success ? (
                        <div className="text-center py-10 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-green-600">Message Sent!</h3>
                            <p className="opacity-70">We've received your message and will get back to you shortly.</p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-sm font-medium underline opacity-50 hover:opacity-100"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-600">Get in Touch</h1>
                                <p className="text-sm opacity-60">We're here to help. Send us a message and we'll get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label htmlFor="name" className="text-sm font-medium opacity-70">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <label htmlFor="email" className="text-sm font-medium opacity-70">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-1">
                                    <label htmlFor="message" className="text-sm font-medium opacity-70">Message</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 w-5 h-5 opacity-40" />
                                        <textarea
                                            id="message"
                                            rows="4"
                                            required
                                            placeholder="Your message here..."
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all resize-none"
                                            style={{ borderColor: 'var(--card-border)', '--tw-ring-color': primaryColor }}
                                        ></textarea>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-transform active:scale-95"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 text-center pt-4 border-t opacity-40 text-xs" style={{ borderColor: 'var(--card-border)' }}>
                        <p>&copy; {new Date().getFullYear()} ST.Akoere. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
