<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Driver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    private const DEFAULT_EMAIL = 'zakaria@gmail.com';
    private const DEFAULT_PASSWORD = 'zakaria123';
    private const STORAGE_PATH = 'admin-account.json';

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = $this->adminAccount();

        if ($data['email'] !== $admin['email'] || !Hash::check($data['password'], $admin['password'])) {
            return response()->json([
                'message' => 'Email or password is incorrect.',
            ], 401);
        }

        return response()->json([
            'message' => 'Admin connected successfully.',
            'role' => 'admin',
            'account' => $this->publicAdmin($admin),
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $clients = Client::latest()->get()->map(fn (Client $client) => $this->withPasswordStatus($client));
        $drivers = Driver::latest()->get()->map(fn (Driver $driver) => $this->withPasswordStatus($driver));
        $bookings = Booking::with(['client', 'driver'])->latest()->get();

        return response()->json([
            'admin' => $this->publicAdmin($this->adminAccount()),
            'stats' => [
                'clients' => $clients->count(),
                'drivers' => $drivers->count(),
                'requests' => $bookings->count(),
                'pending' => $bookings->where('status', 'pending')->count(),
                'accepted' => $bookings->whereIn('status', ['accepted', 'assigned'])->count(),
                'delivered' => $bookings->where('status', 'delivered')->count(),
            ],
            'clients' => $clients,
            'drivers' => $drivers,
            'bookings' => $bookings,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120'],
        ]);

        $admin = [
            ...$this->adminAccount(),
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        $this->saveAdminAccount($admin);

        return response()->json([
            'message' => 'Admin profile updated successfully.',
            'admin' => $this->publicAdmin($admin),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'max:120', 'confirmed'],
        ]);

        $admin = $this->adminAccount();

        if (!Hash::check($data['current_password'], $admin['password'])) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 401);
        }

        $admin['password'] = Hash::make($data['password']);
        $this->saveAdminAccount($admin);

        return response()->json([
            'message' => 'Admin password updated successfully.',
        ]);
    }

    public function updateClient(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120', Rule::unique('clients', 'email')->ignore($client->id)],
            'password' => ['nullable', 'string', 'min:6', 'max:120'],
        ]);

        if (!empty($data['password'])) {
            $data['password_plain'] = $data['password'];
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $client->update($data);

        return response()->json([
            'message' => 'Client updated successfully.',
            'client' => $this->withPasswordStatus($client->refresh()),
        ]);
    }

    public function deleteClient(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully.',
        ]);
    }

    public function updateDriver(Request $request, Driver $driver): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:120', Rule::unique('drivers', 'email')->ignore($driver->id)],
            'vehicle_number' => ['required', 'string', 'max:60'],
            'vehicle_category' => ['required', Rule::in(['A', 'B', 'C'])],
            'password' => ['nullable', 'string', 'min:6', 'max:120'],
        ]);

        if (!empty($data['password'])) {
            $data['password_plain'] = $data['password'];
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $driver->update($data);

        return response()->json([
            'message' => 'Driver updated successfully.',
            'driver' => $this->withPasswordStatus($driver->refresh()),
        ]);
    }

    public function deleteDriver(Driver $driver): JsonResponse
    {
        $driver->delete();

        return response()->json([
            'message' => 'Driver deleted successfully.',
        ]);
    }

    public function updateBooking(Request $request, Booking $booking): JsonResponse
    {
        $data = $request->validate([
            'pickup_address' => ['required', 'string', 'max:180'],
            'destination_address' => ['required', 'string', 'max:180'],
            'vehicle_category' => ['required', Rule::in(['A', 'B', 'C'])],
            'weight_kg' => ['required', 'numeric', 'min:0.1', 'max:99999'],
            'status' => ['required', Rule::in(['pending', 'accepted', 'assigned', 'delivered', 'cancelled'])],
            'driver_id' => ['nullable', 'exists:drivers,id'],
        ]);

        $booking->update($data);

        return response()->json([
            'message' => 'Request updated successfully.',
            'booking' => $booking->refresh()->load(['client', 'driver']),
        ]);
    }

    public function deleteBooking(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json([
            'message' => 'Request deleted successfully.',
        ]);
    }

    private function adminAccount(): array
    {
        if (Storage::disk('local')->exists(self::STORAGE_PATH)) {
            $stored = json_decode(Storage::disk('local')->get(self::STORAGE_PATH), true);
            if (is_array($stored) && isset($stored['email'], $stored['password'])) {
                return $stored + ['name' => 'Zakaria Admin'];
            }
        }

        return [
            'id' => 1,
            'name' => 'Zakaria Admin',
            'email' => self::DEFAULT_EMAIL,
            'password' => Hash::make(self::DEFAULT_PASSWORD),
        ];
    }

    private function saveAdminAccount(array $admin): void
    {
        Storage::disk('local')->put(self::STORAGE_PATH, json_encode([
            'id' => 1,
            'name' => $admin['name'] ?? 'Zakaria Admin',
            'email' => $admin['email'],
            'password' => $admin['password'],
        ], JSON_PRETTY_PRINT));
    }

    private function publicAdmin(array $admin): array
    {
        return [
            'id' => 1,
            'name' => $admin['name'] ?? 'Zakaria Admin',
            'email' => $admin['email'],
            'role' => 'admin',
        ];
    }

    private function withPasswordStatus(Client|Driver $account): Client|Driver
    {
        $account->password_value = $account->password_plain ?: 'Non disponible - reset';

        return $account;
    }
}
