import { VehicleGroup, VehicleVariant } from '@/app/api/inventoryApi';
import { Scooter } from '../ScooterCard';

/**
 * Maps a VehicleGroup from the API to a Scooter interface for display
 * Uses the first available variant or the variant with lowest price
 */
export function mapVehicleGroupToScooter(vehicleGroup: VehicleGroup, variant?: VehicleVariant): Scooter {
  // Find the best variant to display
  const displayVariant = variant || 
    vehicleGroup.variants.find(v => v.status === 'available') ||
    vehicleGroup.variants[0];

  if (!displayVariant) {
    throw new Error('No variant available for vehicle group');
  }

  // Extract image
  const imageUrl = displayVariant.primary_image_url || 
    displayVariant.images.find(img => img.is_primary)?.image_url ||
    displayVariant.images[0]?.image_url ||
    '/placeholder.svg';

  // Extract price
  const price = parseFloat(displayVariant.price);

  // Extract specifications
  const specs = vehicleGroup.specifications || {};
  
  // Determine if new (can be based on created_at date or status_summary)
  const isNew = vehicleGroup.status_summary.available > 0 && 
    vehicleGroup.variants.some(v => {
      const createdDate = new Date(v.created_at);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation < 30; // Consider new if created within 30 days
    });

  // Determine if bestseller (can be based on status_summary.available count)
  const isBestseller = vehicleGroup.status_summary.available > 10;

  // Extract battery info from specifications
  const batteryInfo = specs['Battery'] || '';
  const batteryVoltage = batteryInfo.split('×')[0]?.trim() || batteryInfo;
  const batteryCapacity = batteryInfo.split('×')[1]?.trim() || batteryInfo;

  // Extract motor power
  const motorPower = specs['Motor Power'] || specs['Power'] || '';

  // Extract max speed and convert to number
  const maxSpeedText = specs['Max Speed'] || specs['Top Speed'] || '0 km/h';
  const topSpeed = parseFloat(maxSpeedText.replace(/[^0-9.]/g, '')) || 0;

  // Create a unique ID from the vehicle name and first variant ID
  const id = `vehicle-${vehicleGroup.name.toLowerCase().replace(/\s+/g, '-')}-${displayVariant.id}`;

  return {
    id,
    name: vehicleGroup.name,
    brand: 'ZUJA ELECTRIC',
    price,
    image: imageUrl,
    range: 0, // Range is not in the API response, might need to calculate or add
    topSpeed,
    batteryCapacity: batteryCapacity || vehicleGroup.battery_capacities_available[0] || '',
    batteryVoltage,
    motorPower,
    rating: 4.5, // Default rating, not in API
    reviews: 0, // Default reviews, not in API
    colors: vehicleGroup.colors_available,
    isNew,
    isBestseller,
    isComingSoon: vehicleGroup.status_summary.available === 0 && 
                  (vehicleGroup.status_summary.out_of_stock || 0) > 0,
    description: vehicleGroup.description || '',
    category: 'scooter' as const,
    functions: vehicleGroup.features || [],
    specifications: specs,
    // Store the full vehicle group for reference
    vehicleGroup,
    variant: displayVariant,
  } as Scooter & { vehicleGroup: VehicleGroup; variant: VehicleVariant };
}

/**
 * Maps multiple VehicleGroups to Scooters
 */
export function mapVehicleGroupsToScooters(vehicleGroups: VehicleGroup[]): Scooter[] {
  return vehicleGroups.map(group => mapVehicleGroupToScooter(group));
}

