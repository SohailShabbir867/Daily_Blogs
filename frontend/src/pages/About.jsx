// About page - Daily Blogs platform information
import { Link } from "react-router-dom";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    document.title = "About Us - Daily Blogs | Your Source for Tech Insights";

    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Learn about Daily Blogs - a platform dedicated to sharing knowledge, insights, and stories about web development, programming, design, and technology."
      );
    }
  }, []);

  const teamMembers = [
    {
      name: "Shabbir Sohail",
      role: "Founder & Lead Developer",
      bio: "Full-stack developer passionate about creating innovative web solutions and sharing knowledge with the developer community.",
      avatar: "S",
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Alex Johnson",
      role: "Content Strategist",
      bio: "Expert in crafting engaging technical content that helps developers learn and grow in their careers.",
      avatar: "A",
      color: "from-green-500 to-teal-500",
    },
    {
      name: "Sarah Williams",
      role: "UI/UX Designer",
      bio: "Creative designer focused on building beautiful, accessible, and user-friendly interfaces.",
      avatar: "S",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Readers" },
    { number: "500+", label: "Articles Published" },
    { number: "50+", label: "Expert Authors" },
    { number: "100K+", label: "Monthly Views" },
  ];

  const values = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: "Innovation",
      description:
        "We constantly explore new technologies and approaches to bring you the latest insights in the tech world.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: "Quality Content",
      description:
        "Every article is carefully reviewed to ensure accuracy, clarity, and practical value for our readers.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Community First",
      description:
        "We believe in building a supportive community where developers can learn, share, and grow together.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Always Learning",
      description:
        "Technology evolves rapidly, and so do we. We're committed to continuous learning and improvement.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white py-24 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div
            className="absolute top-40 -right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Decorative Shapes */}
          <div className="absolute top-20 left-[5%] w-20 h-20 border border-white/10 rounded-full" />
          <div className="absolute top-40 right-[10%] w-32 h-32 border border-white/10 rounded-full" />
          <div className="absolute bottom-20 left-[15%] w-16 h-16 border border-white/10 rotate-45" />

          {/* Floating Dots */}
          <div
            className="absolute top-24 left-[15%] w-2 h-2 bg-emerald-300 rounded-full animate-bounce"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute top-48 left-[30%] w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce"
            style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
          />
          <div
            className="absolute top-36 right-[20%] w-2 h-2 bg-teal-300 rounded-full animate-bounce"
            style={{ animationDuration: "3.5s", animationDelay: "1s" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 mb-8 hover:bg-white/15 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400"></span>
              </span>
              <span className="text-sm font-medium text-emerald-100">
                Learn more about us
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              <span className="block text-white drop-shadow-lg">About</span>
              <span className="bg-linear-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Daily Blogs
              </span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
              Empowering developers with knowledge, insights, and inspiration to
              build amazing things.
            </p>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 60L48 54C96 48 192 36 288 42C384 48 480 72 576 78C672 84 768 72 864 60C960 48 1056 36 1152 36C1248 36 1344 48 1392 54L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
                Making Tech Knowledge Accessible to Everyone
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Daily Blogs was founded with a simple yet powerful mission: to
                democratize technical knowledge and make learning accessible to
                developers of all skill levels.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Whether you're a beginner taking your first steps in coding or
                an experienced developer looking to stay updated with the latest
                trends, we've got content tailored for you.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe that sharing knowledge is the key to building a
                stronger, more innovative tech community. Every article we
                publish is crafted with care to provide real value to our
                readers.
              </p>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-emerald-100 to-teal-100 rounded-3xl p-8 md:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-600">
                        {stat.number}
                      </div>
                      <div className="text-gray-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-2xl -z-10 rotate-12" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-400 rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Our Core Values
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">
              The People Behind
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Meet Our Team
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              A passionate group of developers, writers, and designers working
              together to bring you the best content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-24 h-24 bg-linear-to-br ${member.color} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg`}
                >
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-emerald-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Cover Section */}
      <section className="py-20 bg-linear-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              Our Content
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              What We Cover
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Web Development",
                desc: "React, Vue, Angular, Node.js, and modern web technologies",
                icon: "🌐",
              },
              {
                title: "Programming",
                desc: "JavaScript, Python, TypeScript, and best coding practices",
                icon: "💻",
              },
              {
                title: "UI/UX Design",
                desc: "Design principles, CSS tricks, and user experience insights",
                icon: "🎨",
              },
              {
                title: "DevOps & Cloud",
                desc: "Docker, AWS, CI/CD pipelines, and deployment strategies",
                icon: "☁️",
              },
              {
                title: "Career Growth",
                desc: "Interview tips, career advice, and professional development",
                icon: "📈",
              },
              {
                title: "Tech News",
                desc: "Latest updates, trends, and innovations in the tech world",
                icon: "📰",
              },
            ].map((topic, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <span className="text-4xl">{topic.icon}</span>
                <div>
                  <h3 className="text-lg font-bold mb-1">{topic.title}</h3>
                  <p className="text-gray-400">{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of developers and start exploring articles that
            will help you grow your skills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/25"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Browse Articles
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 bg-gray-100 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Daily Blogs. All rights reserved. Made
            with ❤️ for the developer community.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
