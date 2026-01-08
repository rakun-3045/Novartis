import { Link } from 'react-router-dom'
import {
  Activity,
  Users,
  FileSearch,
  BarChart3,
  MessageSquare,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Heart,
  Globe,
  Award,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Play
} from 'lucide-react'

// High-quality medical/clinical trial images from Unsplash (free to use)
const images = {
  hero: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80', // Medical research lab
  mission: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80', // Doctor with tablet
  research: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80', // Lab scientist
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', // Data analytics
  patient: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1b98?w=600&auto=format&fit=crop&q=80', // Healthcare
  team: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&auto=format&fit=crop&q=80', // Medical team
}

const features = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    description: 'Track clinical trial progress across all studies with live dashboards and instant alerts for critical issues.',
    color: 'bg-blue-500'
  },
  {
    icon: Users,
    title: 'Subject Management',
    description: 'Comprehensive subject tracking with risk stratification, status monitoring, and predictive analytics.',
    color: 'bg-green-500'
  },
  {
    icon: FileSearch,
    title: 'Intelligent Data Analysis',
    description: 'Advanced RAG-powered AI that understands your clinical trial data and provides contextual insights.',
    color: 'bg-purple-500'
  },
  {
    icon: BarChart3,
    title: 'ML-Powered Analytics',
    description: 'Machine learning models for risk prediction, dropout analysis, and data quality assessment.',
    color: 'bg-orange-500'
  },
  {
    icon: MessageSquare,
    title: 'AI Clinical Assistant',
    description: 'Natural language interface to query your trial data. Ask questions, get instant expert-level answers.',
    color: 'bg-pink-500'
  },
  {
    icon: Shield,
    title: 'Data Quality Assurance',
    description: 'Automated detection of data discrepancies, protocol deviations, and quality issues across sites.',
    color: 'bg-teal-500'
  }
]

const stats = [
  { value: '23+', label: 'Clinical Studies' },
  { value: '28K+', label: 'Subjects Tracked' },
  { value: '2.5K+', label: 'Sites Monitored' },
  { value: '99.5%', label: 'Data Accuracy' }
]

const team = [
  {
    name: 'Rahul Kumar',
    role: 'ML Engineer & Full Stack Developer',
    email: 'rahul.kumar@example.com',
    linkedin: '#',
    github: '#'
  },
  {
    name: 'Team Member 2',
    role: 'Data Scientist',
    email: 'member2@example.com',
    linkedin: '#',
    github: '#'
  },
  {
    name: 'Team Member 3',
    role: 'Clinical Data Analyst',
    email: 'member3@example.com',
    linkedin: '#',
    github: '#'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-purple-600/10 dark:from-primary-900/20 dark:to-purple-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                Powered by Advanced AI & Machine Learning
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Transform Clinical Trial
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                  Data Management
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                An intelligent platform that empowers clinical research teams with real-time insights, 
                predictive analytics, and AI-powered assistance to ensure trial success and patient safety.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/studies"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105"
                >
                  Explore Studies
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl font-semibold transition-all hover:scale-105"
                >
                  <MessageSquare className="w-5 h-5" />
                  Try AI Assistant
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>GCP Certified</span>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div className="relative lg:block hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-3" />
              <div className="relative">
                <img 
                  src={images.hero}
                  alt="Clinical Research Laboratory"
                  className="rounded-3xl shadow-2xl w-full h-[480px] object-cover border-4 border-white dark:border-slate-700"
                />
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">98.5%</div>
                      <div className="text-sm text-slate-500">Data Accuracy</div>
                    </div>
                  </div>
                </div>
                {/* Floating Card 2 */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">28K+</div>
                      <div className="text-sm text-slate-500">Subjects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Images Grid */}
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src={images.research}
                    alt="Medical Research"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <img 
                    src={images.data}
                    alt="Data Analytics"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img 
                    src={images.mission}
                    alt="Healthcare Professional"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <img 
                    src={images.patient}
                    alt="Patient Care"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-full blur-3xl" />
            </div>
            
            {/* Right - Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                <Target className="w-4 h-4" />
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                Accelerating Clinical Research Through Innovation
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                We believe that every clinical trial has the potential to change lives. Our mission is to 
                empower research teams with cutting-edge technology that streamlines data management, 
                identifies risks early, and ensures the highest standards of patient safety.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Patient-Centric Approach</h3>
                    <p className="text-slate-600 dark:text-slate-400">Every feature is designed with patient safety and trial integrity in mind.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Global Scalability</h3>
                    <p className="text-slate-600 dark:text-slate-400">Built to handle multi-site, multi-country trials with ease and precision.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Excellence in Quality</h3>
                    <p className="text-slate-600 dark:text-slate-400">Advanced ML models ensure data quality and compliance at every step.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features for Clinical Research
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to manage, analyze, and optimize your clinical trials in one integrated platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={images.team}
                alt="Medical Team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-800/90 to-purple-900/85" />
            </div>
            
            {/* Content */}
            <div className="relative px-8 py-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Clinical Trials?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Experience the power of AI-driven clinical trial management. Start exploring your data with our intelligent assistant.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-slate-100 transition-all hover:scale-105 shadow-lg"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Chatting with AI
                </Link>
                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all hover:scale-105"
                >
                  View Analytics
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">ClinicalAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering clinical research teams with intelligent data management and AI-powered insights.
              </p>
              <p className="text-sm text-slate-500">
                Built for the Novartis Health Hackathon 2025
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/studies" className="text-slate-400 hover:text-white transition-colors">Studies</Link>
                </li>
                <li>
                  <Link to="/analytics" className="text-slate-400 hover:text-white transition-colors">Analytics</Link>
                </li>
                <li>
                  <Link to="/chat" className="text-slate-400 hover:text-white transition-colors">AI Assistant</Link>
                </li>
              </ul>
            </div>
            
            {/* Team Contact */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Our Team</h4>
              <div className="space-y-4">
                {team.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{member.name}</div>
                      <div className="text-sm text-slate-400">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${member.email}`} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                      <a href={member.linkedin} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href={member.github} className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 ClinicalAI. Built with ❤️ for better clinical research.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>React + Vite</span>
              <span>•</span>
              <span>FastAPI</span>
              <span>•</span>
              <span>LangChain RAG</span>
              <span>•</span>
              <span>Gemma 27B</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
