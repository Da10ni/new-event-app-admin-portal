import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FormSection from '../../components/forms/FormSection';
import { showToast } from '../../components/feedback/Toast';
import { MdSave } from 'react-icons/md';

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'Events Platform',
    supportEmail: 'support@events.com',
    commissionRate: '10',
    currency: 'USD',
    maxImagesPerListing: '10',
    autoApproveListings: 'false',
    autoApproveVendors: 'false',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNewBooking: true,
    emailNewVendor: true,
    emailNewReview: false,
    emailDailyReport: true,
    emailWeeklyReport: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast.success('General settings saved successfully');
    } catch {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast.success('Notification settings saved successfully');
    } catch {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-600">Settings</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Configure platform settings and preferences</p>
      </div>

      {/* General Settings */}
      <FormSection
        title="General Settings"
        description="Configure basic platform settings and business rules"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Platform Name"
            value={generalSettings.appName}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, appName: e.target.value })
            }
          />
          <Input
            label="Support Email"
            type="email"
            value={generalSettings.supportEmail}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })
            }
          />
          <Input
            label="Commission Rate (%)"
            type="number"
            value={generalSettings.commissionRate}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, commissionRate: e.target.value })
            }
            helperText="Percentage charged on each booking"
          />
          <Select
            label="Default Currency"
            options={[
              { value: 'USD', label: 'USD - US Dollar' },
              { value: 'EUR', label: 'EUR - Euro' },
              { value: 'GBP', label: 'GBP - British Pound' },
              { value: 'KES', label: 'KES - Kenyan Shilling' },
            ]}
            value={generalSettings.currency}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, currency: e.target.value })
            }
          />
          <Input
            label="Max Images Per Listing"
            type="number"
            value={generalSettings.maxImagesPerListing}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, maxImagesPerListing: e.target.value })
            }
          />
          <Select
            label="Auto-Approve Listings"
            options={[
              { value: 'true', label: 'Yes - Auto approve' },
              { value: 'false', label: 'No - Manual review' },
            ]}
            value={generalSettings.autoApproveListings}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, autoApproveListings: e.target.value })
            }
          />
          <Select
            label="Auto-Approve Vendors"
            options={[
              { value: 'true', label: 'Yes - Auto approve' },
              { value: 'false', label: 'No - Manual review' },
            ]}
            value={generalSettings.autoApproveVendors}
            onChange={(e) =>
              setGeneralSettings({ ...generalSettings, autoApproveVendors: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            size="sm"
            icon={<MdSave className="w-4 h-4" />}
            loading={saving}
            onClick={handleSaveGeneral}
          >
            Save General Settings
          </Button>
        </div>
      </FormSection>

      {/* Notification Settings */}
      <FormSection
        title="Notification Settings"
        description="Configure email notifications for admin events"
      >
        <div className="space-y-4">
          {[
            { key: 'emailNewBooking', label: 'New Booking Notification', desc: 'Receive email when a new booking is created' },
            { key: 'emailNewVendor', label: 'New Vendor Registration', desc: 'Receive email when a new vendor registers' },
            { key: 'emailNewReview', label: 'New Review Notification', desc: 'Receive email when a new review is posted' },
            { key: 'emailDailyReport', label: 'Daily Summary Report', desc: 'Receive daily activity summary email' },
            { key: 'emailWeeklyReport', label: 'Weekly Analytics Report', desc: 'Receive weekly analytics and insights' },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-neutral-600">{setting.label}</p>
                <p className="text-xs text-neutral-400">{setting.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    [setting.key]: !notificationSettings[setting.key as keyof typeof notificationSettings],
                  })
                }
                className={`
                  relative w-11 h-6 rounded-full transition-colors duration-200
                  ${notificationSettings[setting.key as keyof typeof notificationSettings]
                    ? 'bg-primary-500'
                    : 'bg-neutral-200'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                    ${notificationSettings[setting.key as keyof typeof notificationSettings]
                      ? 'translate-x-5'
                      : 'translate-x-0'
                    }
                  `}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="primary"
            size="sm"
            icon={<MdSave className="w-4 h-4" />}
            loading={saving}
            onClick={handleSaveNotifications}
          >
            Save Notification Settings
          </Button>
        </div>
      </FormSection>

      {/* Danger Zone */}
      <Card className="border border-error-200">
        <Card.Header
          title="Danger Zone"
          subtitle="Irreversible and destructive actions"
        />
        <Card.Body>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Clear All Cache</p>
              <p className="text-xs text-neutral-400">
                Purge all cached data from the platform
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => showToast.info('Cache cleared successfully')}>
              Clear Cache
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsPage;
