import React from 'react';

export const AboutContent = () => (
    <div className="space-y-8 text-zinc-300 font-sans leading-relaxed">
        <p className="text-xl text-white font-serif italic">
            "The unexamined life is not worth running."
        </p>

        <section>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest font-mono">Our Mission</h3>
            <p>
                DEFRAG is built on a singular premise: <strong>Your internal world has a geometry, and if you can see it, you can change it.</strong>
            </p>
            <p className="mt-4">
                We combine the rigorous precision of system dynamics with the depth of archetypal psychology to create a "Dashboard for the Soul." In an age of algorithmic fragmentation, we provide the tools for conscious integration.
            </p>
        </section>

        <section>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest font-mono">The Team</h3>
            <p>
                We are a small, dedicated collective of engineers, psychologists, and designers operating at the intersection of Technology and Spirit.
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm text-zinc-400">
                <li><span className="text-white">CJO</span> // Lead Architect</li>
                <li><span className="text-white">Gemini 2.0</span> // Artificial Intelligence Core</li>
                <li><span className="text-white">The Field</span> // Collective Conscious Input</li>
            </ul>
        </section>

        <section>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest font-mono">Contact</h3>
            <p>
                For inquiries regarding the protocol, partnerships, or technical support:
                <br />
                <a href="mailto:contact@defrag.app" className="text-emerald-400 hover:underline">contact@defrag.app</a>
            </p>
        </section>
    </div>
);
