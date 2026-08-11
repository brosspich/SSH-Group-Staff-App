const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pjtdmirsfreiyeshpaae.supabase.co';
const supabaseKey = 'sb_publishable_OvHuYrctEQG4u9K5bNj_yw_kcK9T7AI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching current row from ssh-group-staff-attendance-qr...');
  const { data, error } = await supabase.from('ssh-group-staff-attendance-qr').select('*');
  
  if (error) {
    console.error('Error fetching table:', error);
    return;
  }

  console.log('Current data:', data);

  const updatedLocation = [
    'https://www.google.com/maps?q=11.502767,104.851553',
    'https://maps.app.goo.gl/MmFnRaN1ueSwSk48A',
    '11.502767, 104.851553'
  ];

  if (data && data.length > 0) {
    const targetId = data[0].id;
    console.log(`Updating row ID: ${targetId}...`);
    const { data: updateRes, error: updateErr } = await supabase
      .from('ssh-group-staff-attendance-qr')
      .update({
        location: updatedLocation,
        company_name: 'SSH Group'
      })
      .eq('id', targetId)
      .select();

    if (updateErr) {
      console.error('Error updating location:', updateErr);
    } else {
      console.log('SUCCESS! Database updated successfully:', JSON.stringify(updateRes, null, 2));
    }
  }
}

run();
