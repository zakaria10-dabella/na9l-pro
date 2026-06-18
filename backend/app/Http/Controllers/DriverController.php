<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DriverController extends Controller
{
    public function commands(Driver $driver): JsonResponse
    {
        $bookings = Booking::with('client')
            ->whereNull('driver_id')
            ->where('status', 'pending')
            ->where('vehicle_category', $driver->vehicle_category)
            ->latest()
            ->get()
            ->map(fn (Booking $booking) => $this->withEarning($booking));

        return response()->json([
            'driver' => $driver,
            'bookings' => $bookings,
        ]);
    }

    public function accept(Driver $driver, Booking $booking): JsonResponse
    {
        if ($booking->driver_id && $booking->driver_id !== $driver->id) {
            return response()->json([
                'message' => 'This command is already accepted.',
            ], 409);
        }

        if ($booking->vehicle_category !== $driver->vehicle_category) {
            return response()->json([
                'message' => 'This command does not match your vehicle category.',
            ], 422);
        }

        $booking->update([
            'driver_id' => $driver->id,
            'status' => 'accepted',
        ]);

        return response()->json([
            'message' => 'Command accepted successfully.',
            'booking' => $this->withEarning($booking->load(['client', 'driver'])),
        ]);
    }

    public function active(Driver $driver): JsonResponse
    {
        $booking = Booking::with(['client', 'driver'])
            ->where('driver_id', $driver->id)
            ->whereIn('status', ['accepted', 'assigned'])
            ->latest()
            ->first();

        return response()->json([
            'booking' => $booking ? $this->withEarning($booking) : null,
        ]);
    }

    public function dashboard(Driver $driver): JsonResponse
    {
        $bookings = Booking::with('client')
            ->where('driver_id', $driver->id)
            ->latest()
            ->get()
            ->map(fn (Booking $booking) => $this->withEarning($booking));

        $clients = $bookings
            ->pluck('client')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json([
            'driver' => $driver,
            'bookings' => $bookings,
            'clients' => $clients,
            'stats' => [
                'jobs' => $bookings->count(),
                'earnings' => $bookings->sum('earning_amount'),
                'clients' => $clients->count(),
            ],
        ]);
    }

    public function updateLocation(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $driver->update([
            'current_latitude' => $data['latitude'],
            'current_longitude' => $data['longitude'],
            'location_updated_at' => now(),
        ]);

        return response()->json([
            'driver' => $driver->refresh(),
        ]);
    }

    public function updateProfile(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120', Rule::unique('drivers', 'email')->ignore($driver->id)],
            'vehicle_number' => ['required', 'string', 'max:60'],
            'vehicle_category' => ['required', Rule::in(['A', 'B', 'C'])],
        ]);

        $driver->update($data);

        return response()->json([
            'message' => 'Driver profile updated successfully.',
            'driver' => $driver,
        ]);
    }

    public function updatePassword(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'max:120', 'confirmed'],
        ]);

        if (!$driver->password || !Hash::check($data['current_password'], $driver->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 401);
        }

        $driver->update([
            'password' => Hash::make($data['password']),
            'password_plain' => $data['password'],
        ]);

        return response()->json([
            'message' => 'Driver password updated successfully.',
        ]);
    }

    private function withEarning(Booking $booking): Booking
    {
        $base = match ($booking->vehicle_category) {
            'B' => 120,
            'C' => 220,
            default => 70,
        };

        $booking->earning_amount = round($base + ((float) $booking->weight_kg * 1.5), 2);

        return $booking;
    }
}
