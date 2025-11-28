import { DeliveryForm } from "@/test/lalamove-delivery/components/delivery-form";

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚚 Lalamove Delivery
          </h1>
          <p className="text-gray-600">
            Schedule your delivery with real-time pricing and tracking
          </p>
        </div>

        <DeliveryForm />
      </div>
    </div>
  );
}

