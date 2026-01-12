import { useState } from 'react';
import { Users, Mail, Share2, Check, X, Eye, EyeOff, Calendar, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function PartnerSharing() {
  const { currentTheme } = useTheme();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [partners, setPartners] = useState([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex.j@email.com',
      status: 'active',
      permissions: {
        viewCycle: true,
        viewSymptoms: true,
        viewMood: true,
        receivePredictions: true,
      },
    },
  ]);

  const handleInvite = () => {
    if (inviteEmail) {
      const newPartner = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        status: 'pending',
        permissions: {
          viewCycle: true,
          viewSymptoms: false,
          viewMood: false,
          receivePredictions: true,
        },
      };
      setPartners([...partners, newPartner]);
      setInviteEmail('');
      setShowInviteForm(false);
    }
  };

  const togglePermission = (partnerId, permission) => {
    setPartners(partners.map(partner => {
      if (partner.id === partnerId) {
        return {
          ...partner,
          permissions: {
            ...partner.permissions,
            [permission]: !partner.permissions[permission],
          },
        };
      }
      return partner;
    }));
  };

  const removePartner = (partnerId) => {
    setPartners(partners.filter(p => p.id !== partnerId));
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Partner Sharing</h3>
            <p className="text-sm text-gray-600 mt-1">Share your cycle information with your partner</p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className={`px-4 py-2 bg-gradient-to-r ${currentTheme.colors.gradient} text-white rounded-lg hover:shadow-md transition-all text-sm font-medium`}
          >
            + Invite Partner
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {showInviteForm && (
          <div className={`p-6 rounded-2xl bg-gradient-to-r ${currentTheme.colors.light} border-2 border-${currentTheme.id}-200`}>
            <h4 className="font-semibold text-gray-900 mb-4">Invite Your Partner</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner's Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="partner@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleInvite}
                  className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.colors.gradient} text-white rounded-xl font-medium hover:shadow-md transition-all`}
                >
                  Send Invitation
                </button>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {partners.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No partners added yet</p>
            <p className="text-sm text-gray-500">Invite your partner to share cycle information</p>
          </div>
        ) : (
          <div className="space-y-4">
            {partners.map((partner) => (
              <div key={partner.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-6 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.colors.gradient} rounded-full flex items-center justify-center`}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{partner.name}</p>
                        {partner.status === 'active' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{partner.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removePartner(partner.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <X className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  <p className="text-sm font-medium text-gray-900 mb-3">Sharing Permissions</p>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Cycle Information</p>
                        <p className="text-xs text-gray-500">Period dates and predictions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePermission(partner.id, 'viewCycle')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        partner.permissions.viewCycle ? `bg-${currentTheme.id}-500` : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          partner.permissions.viewCycle ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}