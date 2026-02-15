import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  Upload,
  AlertCircle
} from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

function AdminChannelsContent() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [syncing, setSyncing] = useState({});

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  // Fetch channel listings
  const { data: channelListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['channel-listings'],
    queryFn: () => base44.entities.ChannelListing.list()
  });

  // Group listings by product
  const listingsByProduct = channelListings.reduce((acc, listing) => {
    if (!acc[listing.product_id]) {
      acc[listing.product_id] = [];
    }
    acc[listing.product_id].push(listing);
    return acc;
  }, {});

  const syncProduct = async (productId, channel) => {
    setSyncing(prev => ({ ...prev, [`${productId}-${channel}`]: true }));
    try {
      let functionName;
      switch (channel) {
        case 'facebook': functionName = 'exportToFacebook'; break;
        case 'etsy': functionName = 'exportToEtsy'; break;
        case 'tiktok': functionName = 'exportToTikTok'; break;
        case 'shopify': functionName = 'exportToShopify'; break;
        default: throw new Error('Unknown channel');
      }

      const { data } = await base44.functions.invoke(functionName, { product_id: productId });
      
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['channel-listings'] });
      } else {
        alert(`Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(prev => ({ ...prev, [`${productId}-${channel}`]: false }));
    }
  };

  const syncAllChannels = async (productId) => {
    setSyncing(prev => ({ ...prev, [`${productId}-all`]: true }));
    try {
      const { data } = await base44.functions.invoke('syncAllChannels', { 
        product_id: productId 
      });
      
      queryClient.invalidateQueries({ queryKey: ['channel-listings'] });
      
      if (data.summary) {
        alert(`Sync complete!\nSuccessful: ${data.summary.successful}\nFailed: ${data.summary.failed}`);
      }
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(prev => ({ ...prev, [`${productId}-all`]: false }));
    }
  };

  const channels = [
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘' },
    { id: 'etsy', name: 'Etsy', color: '#F56400', icon: '🛍️' },
    { id: 'tiktok', name: 'TikTok Shop', color: '#000000', icon: '🎵' },
    { id: 'shopify', name: 'Shopify', color: '#96BF48', icon: '🛒' }
  ];

  const getChannelStatus = (productId, channelId) => {
    const listings = listingsByProduct[productId] || [];
    return listings.find(l => l.channel === channelId);
  };

  const getStatusBadge = (listing) => {
    if (!listing) {
      return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Not Listed</Badge>;
    }

    if (listing.sync_status === 'synced' && listing.status === 'active') {
      return <Badge className="bg-green-600 gap-1"><CheckCircle className="w-3 h-3" />Active</Badge>;
    }

    if (listing.sync_status === 'failed') {
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Failed</Badge>;
    }

    if (listing.sync_status === 'pending') {
      return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
    }

    return <Badge variant="outline">{listing.status}</Badge>;
  };

  if (productsLoading || listingsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Multi-Channel Management</h1>
          <p className="text-gray-600">Export and sync products across sales channels</p>
        </div>

        {/* Configuration Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Channel Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {channels.map(channel => (
                <div key={channel.id} className="text-center p-4 rounded-lg border">
                  <div className="text-3xl mb-2">{channel.icon}</div>
                  <div className="font-semibold">{channel.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Configure in Secrets
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Setup Required:</strong> Add API credentials for each channel in your app's environment variables:
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4">
                <li>• Facebook: FACEBOOK_ACCESS_TOKEN, FACEBOOK_CATALOG_ID</li>
                <li>• Etsy: ETSY_API_KEY, ETSY_SHOP_ID</li>
                <li>• TikTok: TIKTOK_ACCESS_TOKEN, TIKTOK_SHOP_ID</li>
                <li>• Shopify: SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <div className="space-y-4">
          {products.map(product => {
            const listings = listingsByProduct[product.id] || [];
            const hasAnyListing = listings.length > 0;

            return (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {product.all_images?.[0]?.url && (
                        <img 
                          src={product.all_images[0].url} 
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <CardTitle className="text-xl">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600">{product.product_number}</p>
                        <p className="text-lg font-bold mt-1">${product.price}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => syncAllChannels(product.id)}
                      disabled={syncing[`${product.id}-all`]}
                      className="gap-2"
                    >
                      {syncing[`${product.id}-all`] ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" />Syncing...</>
                      ) : (
                        <><Upload className="w-4 h-4" />Sync All</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {channels.map(channel => {
                      const listing = getChannelStatus(product.id, channel.id);
                      const isSyncing = syncing[`${product.id}-${channel.id}`];

                      return (
                        <div 
                          key={channel.id}
                          className="border rounded-lg p-4"
                          style={{ borderColor: listing?.status === 'active' ? channel.color : '#e5e7eb' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{channel.icon}</span>
                              <span className="font-semibold">{channel.name}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            {getStatusBadge(listing)}
                          </div>

                          {listing?.error_message && (
                            <div className="text-xs text-red-600 mb-2 p-2 bg-red-50 rounded">
                              {listing.error_message}
                            </div>
                          )}

                          {listing?.last_synced_at && (
                            <div className="text-xs text-gray-500 mb-2">
                              Last synced: {new Date(listing.last_synced_at).toLocaleString()}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncProduct(product.id, channel.id)}
                              disabled={isSyncing}
                              className="flex-1"
                            >
                              {isSyncing ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                'Sync'
                              )}
                            </Button>

                            {listing?.listing_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(listing.listing_url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminChannels() {
  return (
    <AdminProtected>
      <AdminChannelsContent />
    </AdminProtected>
  );
}