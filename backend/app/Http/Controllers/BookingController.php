<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'pickup_address' => ['required', 'string', 'max:180'],
            'pickup_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'pickup_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'destination_address' => ['required', 'string', 'max:180'],
            'destination_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'destination_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'vehicle_category' => ['required', Rule::in(['A', 'B', 'C'])],
            'weight_kg' => ['required', 'numeric', 'min:0.1', 'max:99999'],
        ]);

        $booking = Booking::create([
            ...$data,
            'driver_id' => null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking saved successfully.',
            'booking' => $booking->load('driver'),
        ], 201);
    }

    public function dashboard(Client $client): JsonResponse
    {
        $bookings = Booking::with('driver')
            ->where('client_id', $client->id)
            ->latest()
            ->get();

        $drivers = $bookings
            ->pluck('driver')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json([
            'client' => $client,
            'bookings' => $bookings,
            'drivers' => $drivers,
        ]);
    }

    public function active(Client $client): JsonResponse
    {
        $booking = Booking::with(['client', 'driver'])
            ->where('client_id', $client->id)
            ->latest()
            ->first();

        return response()->json([
            'booking' => $booking ? $this->withNearbyDrivers($booking) : null,
        ]);
    }

    private function withNearbyDrivers(Booking $booking): Booking
    {
        $booking->nearby_drivers = Driver::query()
            ->where('vehicle_category', $booking->vehicle_category)
            ->whereNotNull('current_latitude')
            ->whereNotNull('current_longitude')
            ->latest('location_updated_at')
            ->get();

        return $booking;
    }
}
