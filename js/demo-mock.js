/* DEMO ONLY — replaces supabase-js. Nothing in this demo talks to the real
   database: every query answers from this file / localStorage. */
(function(){
  var LS = {
    get: function(k){ try { return localStorage.getItem('bvmdemo_' + k); } catch(_) { return null; } },
    set: function(k, v){ try { localStorage.setItem('bvmdemo_' + k, String(v)); } catch(_) {} }
  };
  function demoUser(){
    var name = LS.get('name');
    if (!name) return null;
    return {
      id: '00000000-0000-4000-8000-00000000d3m0',
      email: LS.get('email') || 'demo@example.com',
      user_metadata: { full_name: name, name: name },
      app_metadata: { provider: 'email' },
      created_at: new Date(Number(LS.get('signedAt')) || Date.now()).toISOString()
    };
  }
  function session(){ var u = demoUser(); return u ? { user: u, access_token: 'demo', expires_at: 9999999999 } : null; }

  function rowsFor(table, single){
    var u = demoUser();
    if (table === 'profiles' && u) {
      var p = { id: u.id, full_name: u.user_metadata.full_name, email: u.email, role: 'student_lead', phone: null, created_at: u.created_at };
      return single ? p : [p];
    }
    if ((table === 'portal_questionnaires' || table === 'course_questionnaires') && u) {
      var q = { id: 1, user_id: u.id, created_at: u.created_at };
      return single ? q : [q];
    }
    return single ? null : [];
  }

  function query(table){
    var single = false;
    var q = {
      then: function(res, rej){ return Promise.resolve({ data: rowsFor(table, single), error: null, count: 0 }).then(res, rej); }
    };
    ['select','eq','neq','gt','gte','lt','lte','like','ilike','is','in','contains','order','limit','range',
     'match','not','or','filter','insert','upsert','update','delete','returns','throwOnError','abortSignal','csv','textSearch','overlaps']
      .forEach(function(m){ q[m] = function(){ return q; }; });
    q.single = function(){ single = true; return q; };
    q.maybeSingle = function(){ single = true; return q; };
    return q;
  }

  var listeners = [];
  var client = {
    auth: {
      getSession: function(){ return Promise.resolve({ data: { session: session() }, error: null }); },
      getUser: function(){ return Promise.resolve({ data: { user: demoUser() }, error: null }); },
      refreshSession: function(){ return Promise.resolve({ data: { session: session() }, error: null }); },
      onAuthStateChange: function(cb){ listeners.push(cb); setTimeout(function(){ try { cb(session() ? 'SIGNED_IN' : 'SIGNED_OUT', session()); } catch(_){} }, 0);
        return { data: { subscription: { unsubscribe: function(){} } } }; },
      signOut: function(){ try { ['name','email','signedAt'].forEach(function(k){ localStorage.removeItem('bvmdemo_' + k); }); } catch(_){}
        location.href = 'signup.html'; return Promise.resolve({ error: null }); },
      signInWithPassword: function(){ return Promise.resolve({ data: {}, error: { message: 'demo' } }); },
      signUp: function(){ return Promise.resolve({ data: {}, error: { message: 'demo' } }); },
      signInWithOAuth: function(){ return Promise.resolve({ data: {}, error: null }); },
      resetPasswordForEmail: function(){ return Promise.resolve({ data: {}, error: null }); },
      updateUser: function(){ return Promise.resolve({ data: {}, error: null }); }
    },
    from: function(t){ return query(t); },
    rpc: function(){ return query('rpc'); },
    functions: { invoke: function(){ return Promise.resolve({ data: null, error: { message: 'demo' } }); } },
    storage: { from: function(){ return {
      createSignedUrl: function(){ return Promise.resolve({ data: null, error: { message: 'demo' } }); },
      list: function(){ return Promise.resolve({ data: [], error: null }); },
      getPublicUrl: function(){ return { data: { publicUrl: '' } }; } }; } },
    channel: function(){ var c = { on: function(){ return c; }, subscribe: function(){ return c; } }; return c; },
    removeChannel: function(){}
  };
  window.supabase = { createClient: function(){ return client; } };
  window.supabaseClient = client;
  window.__BVM_DEMO__ = true;
})();
