import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, Image as ImageIcon, Award, MapPin, DollarSign, Tag, FileText, Star } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  eventType: string;
  imageUrl: string;
}

interface ServiceOffered {
  id: string;
  name: string;
}

export const VendorPortfolio: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Profile Data
  const [profileData, setProfileData] = useState({
    businessName: 'Elegant Decor Co.',
    category: 'Decor',
    tagline: 'Transforming spaces into magical experiences',
    about: 'Elegant Decor Co. transforms venues into magical spaces. We specialize in contemporary and traditional decor themes, bringing your vision to life with creativity and attention to detail.',
    location: 'Mumbai, Maharashtra',
    priceRangeMin: '50000',
    priceRangeMax: '200000',
    yearsExperience: '8',
    contactEmail: 'contact@elegantdecor.com',
    contactPhone: '+91 98765 43210',
    website: 'www.elegantdecor.com'
  });

  const [services, setServices] = useState<ServiceOffered[]>([
    { id: '1', name: 'Stage Decoration' },
    { id: '2', name: 'Floral Arrangements' },
    { id: '3', name: 'Lighting Setup' },
    { id: '4', name: 'Theme Decor' },
    { id: '5', name: 'Entrance Arch' }
  ]);

  const [specialties, setSpecialties] = useState<string[]>([
    'Wedding Decor',
    'Corporate Events',
    'Traditional Themes',
    'Modern Minimalist',
    'Luxury Setups'
  ]);

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Modern Minimalist Wedding',
      description: 'Contemporary white and gold theme with elegant floral arrangements',
      eventType: 'Wedding',
      imageUrl: 'placeholder1.jpg'
    },
    {
      id: '2',
      title: 'Traditional South Indian Decor',
      description: 'Rich traditional setup with marigold flowers and cultural elements',
      eventType: 'Wedding',
      imageUrl: 'placeholder2.jpg'
    },
    {
      id: '3',
      title: 'Corporate Gala Setup',
      description: 'Professional and sophisticated decor for corporate annual event',
      eventType: 'Corporate',
      imageUrl: 'placeholder3.jpg'
    }
  ]);

  const [newService, setNewService] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const addService = () => {
    if (newService.trim()) {
      setServices([...services, { id: Date.now().toString(), name: newService.trim() }]);
      setNewService('');
    }
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  const addPortfolioItem = () => {
    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      eventType: '',
      imageUrl: ''
    };
    setPortfolioItems([...portfolioItems, newItem]);
  };

  const updatePortfolioItem = (id: string, field: keyof PortfolioItem, value: string) => {
    setPortfolioItems(portfolioItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(portfolioItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const categories = [
    'Decor', 'Catering', 'AV', 'Venue', 'Transport', 
    'Florals', 'Photography', 'Lighting', 'Entertainment', 'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            My Portfolio
          </h1>
          <p className="text-gray-500">Manage your marketplace profile and showcase your work</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Star className="text-white fill-white" size={18} />
          </div>
          <div>
            <p className="font-semibold text-green-900">Portfolio Updated!</p>
            <p className="text-sm text-green-700">Your changes are now visible in the marketplace</p>
          </div>
        </motion.div>
      )}

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={profileData.businessName}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="category"
                value={profileData.category}
                onChange={handleProfileChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={profileData.tagline}
              onChange={handleProfileChange}
              placeholder="A brief catchy tagline for your business"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About Your Business *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
              <textarea
                name="about"
                value={profileData.about}
                onChange={handleProfileChange}
                rows={4}
                placeholder="Describe your business, experience, and what makes you unique..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                placeholder="City, State"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Years of Experience *
            </label>
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                name="yearsExperience"
                value={profileData.yearsExperience}
                onChange={handleProfileChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Price Range (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                name="priceRangeMin"
                value={profileData.priceRangeMin}
                onChange={handleProfileChange}
                placeholder="50000"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price Range (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                name="priceRangeMax"
                value={profileData.priceRangeMax}
                onChange={handleProfileChange}
                placeholder="200000"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="contactEmail"
              value={profileData.contactEmail}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={profileData.contactPhone}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={profileData.website}
              onChange={handleProfileChange}
              placeholder="www.yourbusiness.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Services Offered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Services Offered
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addService()}
            placeholder="Add a service..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
          />
          <button
            onClick={addService}
            className="px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {services.map(service => (
            <div key={service.id} className="flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] text-[#6E3482] rounded-lg">
              <span className="font-semibold text-sm">{service.name}</span>
              <button onClick={() => removeService(service.id)} className="hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Specialties */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Specialties & Expertise
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
            placeholder="Add a specialty..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
          />
          <button
            onClick={addSpecialty}
            className="px-6 py-3 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {specialties.map(specialty => (
            <div key={specialty} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
              <span className="font-semibold text-sm">{specialty}</span>
              <button onClick={() => removeSpecialty(specialty)} className="hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Portfolio Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Portfolio Gallery
          </h2>
          <button
            onClick={addPortfolioItem}
            className="flex items-center gap-2 px-4 py-2 border-2 border-[#6E3482] text-[#6E3482] rounded-xl font-semibold hover:bg-[#F3E8FF] transition-all"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        <div className="space-y-6">
          {portfolioItems.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Portfolio Item {index + 1}</h3>
                <button
                  onClick={() => removePortfolioItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updatePortfolioItem(item.id, 'title', e.target.value)}
                    placeholder="e.g., Modern Minimalist Wedding"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <input
                    type="text"
                    value={item.eventType}
                    onChange={(e) => updatePortfolioItem(item.id, 'eventType', e.target.value)}
                    placeholder="e.g., Wedding, Corporate, Birthday"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updatePortfolioItem(item.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe this project..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#A56ABD] focus:ring-4 focus:ring-[#F3E8FF]/50 outline-none transition-all resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#A56ABD] transition-colors cursor-pointer">
                    <ImageIcon className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {portfolioItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="mx-auto mb-3 text-gray-300" size={64} />
            <p>No portfolio items yet. Add your first project to showcase your work!</p>
          </div>
        )}
      </motion.div>

      {/* Preview Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-[#F3E8FF] to-[#E9D5FF] rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Portfolio Tips
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Add high-quality images of your best work to attract more clients</li>
              <li>• Keep your description clear and highlight what makes you unique</li>
              <li>• Update your portfolio regularly with recent projects</li>
              <li>• Accurate pricing helps clients find services within their budget</li>
              <li>• List all services you offer to appear in more searches</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 gradient-purple-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving Changes...' : 'Save Portfolio'}
        </button>
      </div>
    </div>
  );
};
