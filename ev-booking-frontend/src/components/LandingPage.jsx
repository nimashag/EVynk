import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Play, Phone, Mail, MapPin, Facebook, Twitter, Instagram, User } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-900 to-teal-800 relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="lg:hidden">
              <Link to="/">
                <img src="images/logo.png" alt="Logo" className="h-10" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-between w-full">
            <div className="mx-8">
                <Link to="/">
                  <img src="images/logo.png" alt="Logo" className="h-16" />
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 text-white text-sm font-medium uppercase flex-1">
                <Link to="/" className="hover:text-lime-400 transition">Home</Link>
                <Link to="/about" className="hover:text-lime-400 transition">About Us</Link>
                <Link to="/services" className="hover:text-lime-400 transition">Services</Link>
                <Link to="/contact" className="hover:text-lime-400 transition">Contact Us</Link>
              </div>
              
              <div className="flex items-center space-x-4 flex-1 justify-end">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-lime-500 hover:bg-lime-600 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
                >
                  <User size={18} />
                  Login
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-100 absolute w-full shadow-lg">
            <nav className="flex flex-col p-4">
              <Link to="/" className="py-3 border-b hover:bg-lime-500 hover:text-white px-4 transition">Home</Link>
              <Link to="/about" className="py-3 border-b hover:bg-lime-500 hover:text-white px-4 transition">About Us</Link>
              <Link to="/services" className="py-3 border-b hover:bg-lime-500 hover:text-white px-4 transition">Services</Link>
              <Link to="/contact" className="py-3 border-b hover:bg-lime-500 hover:text-white px-4 transition">Contact Us</Link>
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="mt-4 bg-lime-500 text-white py-3 px-4 rounded-lg hover:bg-lime-600 transition flex items-center justify-center gap-2"
              >
                <User size={18} />
                Login
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Login Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isLoginOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Login</h2>
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Backoffice</h3>
              <p className="text-blue-600 mb-4">Manage users, stations, and system settings</p>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 inline-block w-full text-center"
              >
                Admin Login
              </Link>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Station Operator</h3>
              <p className="text-green-600 mb-4">Monitor and manage charging stations</p>
              <Link
                to="/login"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 inline-block w-full text-center"
              >
                Operator Login
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-600 mb-4">Don't have an account?</p>
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isLoginOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsLoginOpen(false)}
        />
      )}

      {/* Banner Section */}
      <section className="bg-gradient-to-b from-teal-900 to-teal-800 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center lg:text-left mb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-2/3">
                <h5 className="text-white uppercase text-sm mb-2 font-medium">Eco Friendly Solution</h5>
                <h1 className="text-4xl lg:text-6xl font-bold text-white border-l-4 border-lime-500 pl-4">
                  <span className="text-lime-400">Powering</span> a Sustainable tomorrow
                </h1>
              </div>
              <div className="lg:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-lime-500 rounded-full flex items-center justify-center animate-spin-slow">
                    <span className="text-white text-xs font-medium">Explore Catalog</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Slider */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-2/3 order-2 lg:order-1">
                {currentSlide === 0 ? (
                  <img src="images/slider-img1.png" alt="Tesla Model 3" className="w-full rounded-lg" />
                ) : (
                  <img src="images/slider-img2.png" alt="Hyundai Ioniq 6" className="w-full rounded-lg" />
                )}
              </div>
              <div className="lg:w-1/3 order-1 lg:order-2 text-white">
                {currentSlide === 0 ? (
                  <>
                    <h3 className="text-2xl font-bold mb-4">Tesla Model 3</h3>
                    <p className="mb-6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae est voluptas excepturi labore numquam aspernatur ullam officiis eum ea quaerat.</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-200 text-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div><span className="text-3xl font-bold">16</span> Hrs</div>
                          <div className="text-3xl text-lime-500">⚡</div>
                        </div>
                        <span className="text-xs uppercase font-semibold">Non Stop</span>
                      </div>
                      <div className="bg-gray-200 text-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div><span className="text-3xl font-bold">CO</span>2</div>
                          <div className="text-3xl text-lime-500">🍃</div>
                        </div>
                        <span className="text-xs uppercase font-semibold">Carbon Free</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-4">Hyundai Ioniq 6</h3>
                    <p className="mb-6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae est voluptas excepturi labore numquam aspernatur ullam officiis eum ea quaerat.</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-200 text-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div><span className="text-3xl font-bold">14</span> Hrs</div>
                          <div className="text-3xl text-lime-500">⚡</div>
                        </div>
                        <span className="text-xs uppercase font-semibold">Non Stop</span>
                      </div>
                      <div className="bg-gray-200 text-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <div><span className="text-3xl font-bold">CO</span>2</div>
                          <div className="text-3xl text-lime-500">🍃</div>
                        </div>
                        <span className="text-xs uppercase font-semibold">Carbon Free</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Slider Dots */}
            <div className="flex justify-center lg:justify-end gap-2 mt-6">
              <button
                onClick={() => setCurrentSlide(0)}
                className={`w-3 h-3 rounded-full transition ${currentSlide === 0 ? 'bg-lime-500' : 'bg-white'}`}
              />
              <button
                onClick={() => setCurrentSlide(1)}
                className={`w-3 h-3 rounded-full transition ${currentSlide === 1 ? 'bg-lime-500' : 'bg-white'}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-b from-lime-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h6 className="text-lime-600 uppercase text-sm mb-2 font-medium">About Us</h6>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 border-l-4 border-lime-500 pl-4">
                Charging Solutions For all <span className="text-lime-600">business and EV Drivers</span>
              </h2>
              <p className="mb-6 text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique recusandae id nihil, enim magni tempora quo! Officiis, maxime accusamus. voluptatum adipisci.</p>
              
              {/* Progress Bars */}
              <div className="space-y-6">
                <div>
                  <span className="font-bold text-gray-800 block mb-2">Eco-friendly Charging</span>
                  <div className="bg-teal-800 h-4 rounded-full relative overflow-hidden">
                    <div 
                      className="bg-lime-500 h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: '90%' }}
                    >
                      <div className="absolute -top-10 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
                        90%
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-gray-800 block mb-2">Energy Storage Systems</span>
                  <div className="bg-teal-800 h-4 rounded-full relative overflow-hidden">
                    <div 
                      className="bg-lime-500 h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: '85%' }}
                    >
                      <div className="absolute -top-10 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
                        85%
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-gray-800 block mb-2">EV Drivers Services</span>
                  <div className="bg-teal-800 h-4 rounded-full relative overflow-hidden">
                    <div 
                      className="bg-lime-500 h-full rounded-full transition-all duration-1000 relative"
                      style={{ width: '89%' }}
                    >
                      <div className="absolute -top-10 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
                        89%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=800&fit=crop" alt="About" className="w-full rounded-2xl shadow-lg" />
              <div className="absolute -bottom-6 -right-6 bg-lime-600 border-4 border-lime-50 p-6 rounded-2xl text-white text-center">
                <img src="https://via.placeholder.com/50/ffffff/87C332?text=⚡" alt="Icon" className="mx-auto mb-2" />
                <h2 className="text-4xl font-bold">50+</h2>
                <span className="text-sm">Charging Stations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gradient-to-b from-white to-lime-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div className="lg:w-2/3">
              <h6 className="text-lime-600 uppercase text-sm mb-2 font-medium">Our Services</h6>
              <h2 className="text-3xl lg:text-4xl font-bold border-l-4 border-lime-500 pl-4">
                Best EV <span className="text-lime-600">charging service</span> for your electric vehicle
              </h2>
            </div>
            <div className="lg:w-1/3">
              <p className="mb-4 text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi dolor architecto molestias aritatis minima accusamus.</p>
              <button className="bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition">More Services</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">🔌</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">Home Charging</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
            
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">⚡</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">Renewable Energy</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
            
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">🚗</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">EV Drivers</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
            
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">🔋</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">AC Charger</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
            
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">⚡</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">DC Charger</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
            
            <div className="bg-white border-2 border-lime-100 rounded-2xl p-6 shadow-lg hover:bg-teal-900 hover:text-white transition-all group">
              <div className="text-5xl mb-4">🔌</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-white">24/7 Support</h4>
              <p className="mb-4 text-gray-600 group-hover:text-gray-200">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla voluptate amet enim atque impedit inventore.</p>
              <button className="border border-lime-500 text-gray-800 group-hover:text-white px-4 py-2 rounded hover:bg-lime-500 hover:text-white transition">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-gradient-to-b from-lime-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div className="lg:w-2/3">
              <h6 className="text-lime-600 uppercase text-sm mb-2 font-medium">Our Portfolio</h6>
              <h2 className="text-3xl lg:text-4xl font-bold border-l-4 border-lime-500 pl-4">
                Take a look at some of our ongoing <span className="text-lime-600">EV Projects</span>
              </h2>
            </div>
            <div className="lg:w-1/3">
              <p className="mb-4 text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi dolor architecto molestias a quodritatis minima accusamus.</p>
              <button className="bg-lime-500 text-white px-6 py-3 rounded-lg hover:bg-lime-600 transition">All Projects</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-2 border-lime-100 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400&h=300&fit=crop" alt="Project 1" className="w-full h-64 object-cover group-hover:blur-sm transition" />
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 transform translate-y-12 group-hover:translate-y-0 transition-transform">
                  <h5 className="text-xl font-bold mb-4">EV Charging Station Finder</h5>
                  <div className="bg-teal-800 h-2 rounded-full mb-4">
                    <div className="bg-lime-500 h-full rounded-full relative" style={{ width: '90%' }}>
                      <div className="absolute -top-8 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        90%
                      </div>
                    </div>
                  </div>
                  <span className="text-sm"><span className="text-lime-600 font-bold">90%</span> Completed</span>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-lime-100 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop" alt="Project 2" className="w-full h-64 object-cover group-hover:blur-sm transition" />
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 transform translate-y-12 group-hover:translate-y-0 transition-transform">
                  <h5 className="text-xl font-bold mb-4">AI Based charge prediction</h5>
                  <div className="bg-teal-800 h-2 rounded-full mb-4">
                    <div className="bg-lime-500 h-full rounded-full relative" style={{ width: '85%' }}>
                      <div className="absolute -top-8 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        85%
                      </div>
                    </div>
                  </div>
                  <span className="text-sm"><span className="text-lime-600 font-bold">85%</span> Completed</span>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-lime-100 rounded-2xl overflow-hidden group cursor-pointer">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1556800572-58d53c8ea5e0?w=400&h=300&fit=crop" alt="Project 3" className="w-full h-64 object-cover group-hover:blur-sm transition" />
                <div className="absolute bottom-0 left-0 right-0 bg-white p-6 transform translate-y-12 group-hover:translate-y-0 transition-transform">
                  <h5 className="text-xl font-bold mb-4">Smart EV charging platform</h5>
                  <div className="bg-teal-800 h-2 rounded-full mb-4">
                    <div className="bg-lime-500 h-full rounded-full relative" style={{ width: '95%' }}>
                      <div className="absolute -top-8 right-0 bg-lime-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                        95%
                      </div>
                    </div>
                  </div>
                  <span className="text-sm"><span className="text-lime-600 font-bold">95%</span> Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-teal-900 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h6 className="text-sm uppercase mb-2">Subscribe Newsletter</h6>
              <h2 className="text-2xl font-bold mb-4">Don't miss our future updates!</h2>
              <div className="flex gap-2">
                <input type="email" placeholder="Email Address" className="flex-1 px-4 py-3 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-lime-500" />
                <button className="bg-lime-500 px-6 py-3 rounded hover:bg-lime-600 transition">Subscribe</button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Link</h3>
              <div className="w-12 border-b border-white mb-6"></div>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-lime-400 transition">About Us</Link></li>
                <li><Link to="/services" className="hover:text-lime-400 transition">Services</Link></li>
                <li><Link to="/contact" className="hover:text-lime-400 transition">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <div className="w-12 border-b border-white mb-6"></div>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-lime-400 transition">Support Plans</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Benefits</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Subscriptions</a></li>
                <li><a href="#" className="hover:text-lime-400 transition">Payment Methods</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <img src="images/logo.png" alt="Logo" className="h-12" />
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-lime-500 transition">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-lime-500 transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-lime-500 transition">
                  <Instagram size={20} />
                </a>
              </div>
            </div>
            
            <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm">
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} /> 256 Elizabeth Ave, CA, 90025
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone size={16} /> +569 2316 2156
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail size={16} /> info@evynk.com
                  </span>
                </div>
                <p className="text-center lg:text-right">2025 EVynk. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;