import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle,
  TruckIcon,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  ArrowLeft,
  Download,
  Share2,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
}

interface TrackingInfo {
  orderNumber: string;
  trackingNumber: string;
  currentStatus: string;
  estimatedDelivery: string;
  carrier: string;
  shippingMethod: string;
  events: TrackingEvent[];
  packageInfo: {
    weight: string;
    dimensions: string;
  };
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
  };
}

const TrackOrder = () => {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const navigate = useNavigate();
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock tracking data
  const [trackingInfo] = useState<TrackingInfo | null>({
    orderNumber: orderNumber || 'VJF-2026-001234',
    trackingNumber: 'TRK123456789',
    currentStatus: 'In Transit',
    estimatedDelivery: '2026-01-25',
    carrier: 'VJ Fans Hub Express',
    shippingMethod: 'Standard Delivery',
    events: [
      {
        id: '1',
        status: 'Order Placed',
        description: 'Your order has been successfully placed and confirmed',
        location: 'Los Angeles, CA',
        timestamp: '2026-01-20T10:30:00',
        isCompleted: true,
      },
      {
        id: '2',
        status: 'Processing',
        description: 'Order is being prepared for shipment',
        location: 'Warehouse - Los Angeles, CA',
        timestamp: '2026-01-20T14:45:00',
        isCompleted: true,
      },
      {
        id: '3',
        status: 'Shipped',
        description: 'Package has been picked up by carrier',
        location: 'Distribution Center - Los Angeles, CA',
        timestamp: '2026-01-21T08:15:00',
        isCompleted: true,
      },
      {
        id: '4',
        status: 'In Transit',
        description: 'Package is on the way to destination',
        location: 'Regional Hub - Phoenix, AZ',
        timestamp: '2026-01-22T16:30:00',
        isCompleted: true,
      },
      {
        id: '5',
        status: 'Out for Delivery',
        description: 'Package is out for delivery',
        location: 'Local Facility - Your City',
        timestamp: '2026-01-25T07:00:00',
        isCompleted: false,
      },
      {
        id: '6',
        status: 'Delivered',
        description: 'Package has been delivered',
        location: 'Your Address',
        timestamp: '2026-01-25T15:00:00',
        isCompleted: false,
      },
    ],
    packageInfo: {
      weight: '2.5 lbs',
      dimensions: '12 x 10 x 4 inches',
    },
    recipient: {
      name: 'John Doe',
      address: '123 Gaming Street',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      phone: '+1 (555) 123-4567',
      email: 'john.doe@example.com',
    },
  });

  const handleTrackOrder = () => {
    if (trackingNumberInput.trim()) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to track page with tracking number
        navigate(`/track-order/${trackingNumberInput}`);
      }, 1000);
    }
  };

  const getCurrentStepIndex = () => {
    if (!trackingInfo) return 0;
    const completedEvents = trackingInfo.events.filter((e) => e.isCompleted);
    return completedEvents.length;
  };

  const getProgressPercentage = () => {
    if (!trackingInfo) return 0;
    const currentStep = getCurrentStepIndex();
    return (currentStep / trackingInfo.events.length) * 100;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <button
            onClick={() => navigate('/orders')}
            className="group inline-flex items-center gap-2 text-white/60 hover:text-[#FFD700] mb-4 sm:mb-6 transition-colors text-sm sm:text-base touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </button>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4">
            <TruckIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FFD700] flex-shrink-0" />
            <span className="break-words">Track Order</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg">
            Follow your package every step of the way
          </p>
        </motion.div>

        {!orderNumber && !trackingInfo ? (
          /* Track Order Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-3"
          >
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FFD700]/10 border-2 border-[#FFD700]/30 mb-3 sm:mb-4">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFD700]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Enter Your Tracking Information
                </h2>
                <p className="text-white/60 text-sm sm:text-base">
                  Track your order using order number or tracking number
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm font-medium mb-2 block">
                    Order Number or Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    placeholder="e.g., VJF-2026-001234 or TRK123456789"
                    className="w-full px-4 py-3 sm:py-4 bg-black/30 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 text-center font-mono touch-manipulation"
                  />
                </div>

                <button
                  onClick={handleTrackOrder}
                  disabled={!trackingNumberInput.trim() || isLoading}
                  className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm sm:text-base font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                >
                  {isLoading ? 'Tracking...' : 'Track Order'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="text-[#FFD700] hover:text-[#FFA500] text-sm font-semibold transition-colors touch-manipulation"
                >
                  View All My Orders
                </button>
              </div>
            </div>
          </motion.div>
        ) : trackingInfo ? (
          /* Tracking Information */
          <div className="space-y-8">
            {/* Status Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-6">
                    Order Status: <span className="text-[#FFD700] break-words">{trackingInfo.currentStatus}</span>
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/60 text-xs sm:text-sm">Order Number</div>
                        <div className="text-white text-sm sm:text-base font-mono font-semibold break-all">
                          {trackingInfo.orderNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/60 text-xs sm:text-sm">Tracking Number</div>
                        <div className="text-white text-sm sm:text-base font-mono font-semibold break-all">
                          {trackingInfo.trackingNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/60 text-xs sm:text-sm">Estimated Delivery</div>
                        <div className="text-white text-sm sm:text-base font-semibold break-words">
                          {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-white/60 text-xs sm:text-sm">Carrier</div>
                        <div className="text-white text-sm sm:text-base font-semibold">{trackingInfo.carrier}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 0.45 * (typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : 256) * 0.5}`}
                        strokeDashoffset={`${2 * Math.PI * 0.45 * (typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : 256) * 0.5 * (1 - getProgressPercentage() / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFD700" />
                          <stop offset="100%" stopColor="#FFA500" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <TruckIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#FFD700] mb-2" />
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                        {Math.round(getProgressPercentage())}%
                      </div>
                      <div className="text-white/60 text-xs sm:text-sm mt-1">Complete</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 touch-manipulation">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Receipt
                </button>
                <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 touch-manipulation">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Share Tracking
                </button>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Tracking Timeline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-2xl p-8 border border-white/10"
              >
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#FFD700]" />
                  Tracking History
                </h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
                  <div
                    className="absolute left-6 top-0 w-0.5 bg-gradient-to-b from-[#FFD700] to-[#FFA500] transition-all duration-1000"
                    style={{
                      height: `${(getCurrentStepIndex() / (trackingInfo.events.length - 1)) * 100}%`,
                    }}
                  />

                  <div className="space-y-8">
                    {trackingInfo.events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {/* Timeline Node */}
                        <div
                          className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-500 ${
                            event.isCompleted
                              ? 'bg-[#FFD700] border-[#FFD700] shadow-lg shadow-[#FFD700]/50'
                              : 'bg-[#1a1a2e] border-white/20'
                          }`}
                        >
                          {event.isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-black" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-white/40" />
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 pb-8">
                          <div
                            className={`p-4 rounded-xl border transition-all duration-300 ${
                              event.isCompleted
                                ? 'bg-[#FFD700]/5 border-[#FFD700]/30'
                                : 'bg-black/20 border-white/10'
                            }`}
                          >
                            <h4
                              className={`font-bold mb-1 ${
                                event.isCompleted ? 'text-[#FFD700]' : 'text-white/60'
                              }`}
                            >
                              {event.status}
                            </h4>
                            <p
                              className={`text-sm mb-2 ${
                                event.isCompleted ? 'text-white' : 'text-white/40'
                              }`}
                            >
                              {event.description}
                            </p>
                            <div
                              className={`flex flex-wrap items-center gap-4 text-xs ${
                                event.isCompleted ? 'text-white/60' : 'text-white/30'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Delivery & Package Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Recipient Info */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#FFD700]" />
                    Delivery Address
                  </h3>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-white font-semibold">{trackingInfo.recipient.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="text-sm">
                        <div>{trackingInfo.recipient.address}</div>
                        <div>
                          {trackingInfo.recipient.city}, {trackingInfo.recipient.state}{' '}
                          {trackingInfo.recipient.zip}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="text-sm">{trackingInfo.recipient.phone}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-[#FFD700] mt-1 flex-shrink-0" />
                      <div className="text-sm">{trackingInfo.recipient.email}</div>
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#FFD700]" />
                    Package Details
                  </h3>
                  <div className="space-y-3 text-white/80 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Weight</span>
                      <span className="font-semibold">{trackingInfo.packageInfo.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Dimensions</span>
                      <span className="font-semibold">{trackingInfo.packageInfo.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Shipping Method</span>
                      <span className="font-semibold">{trackingInfo.shippingMethod}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;
