<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => Hash::make('password')]
        );

        Client::updateOrCreate(
            ['email' => 'client@na9lpro.ma'],
            [
                'first_name' => 'Client',
                'last_name' => 'Demo',
                'phone' => '0600000001',
                'password' => Hash::make('client123'),
                'password_plain' => 'client123',
            ]
        );

        Driver::updateOrCreate(
            ['email' => 'driver@na9lpro.ma'],
            [
                'first_name' => 'Driver',
                'last_name' => 'Demo',
                'phone' => '0600000002',
                'password' => Hash::make('driver123'),
                'password_plain' => 'driver123',
                'vehicle_number' => 'NA9L-001',
                'vehicle_category' => 'A',
            ]
        );
    }
}
