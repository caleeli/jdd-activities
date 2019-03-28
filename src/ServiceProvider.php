<?php

namespace JDD\Activities;

use App\Facades\JDD;
use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use JDD\Activities\Models\Diagram;

class ServiceProvider extends BaseServiceProvider
{
    const PluginName = 'jdd/activities';

    /**
     * Inicializa el modulo
     */
    public function boot()
    {
        $this->publishes([
            __DIR__ . '/../dist' => public_path('modules/' . self::PluginName),
        ], self::PluginName);
        JDD::addModule(
            self::PluginName,
            // Javascripts
            ['/modules/' . self::PluginName . '/jdd-activities.umd.js'],
            // Stylesheets
            ['/modules/' . self::PluginName . '/jdd-activities.css'],
            // BPMN
            [realpath(__DIR__ . '/bpmn/ActivitiesDesigner.bpmn')],
            // Models
            [Diagram::class]
        );
        $this->loadMigrationsFrom(__DIR__ . '/migrations');
    }
}
