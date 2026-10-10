<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::firstOrCreate(
            ['slug' => 'general'],
            [
                'name' => 'General',
                'description' => 'General music education materials.',
            ],
        );
    }
}
