class SWHelper {

  static registerServiceWorker() {
    if(!navigator.serviceWorker) return;

    navigator.serviceWorker.register('/sw.js').then( reg => {

        console.log('Registered!');

        if(!navigator.serviceWorker.controller) return;

        if(reg.waiting){
          console.log('Waiting')
          updateReady(reg.waiting);
          return;
        }

        if(reg.installing){
          console.log('Installing')
          trackInstalling(reg.installing);
          return;
        }

        reg.addEventListener('updatefound', () =>{
          trackInstalling(reg.installing);
        })
    });
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

trackInstalling = worker =>{
  console.log('tracking');
  worker.addEventListener('statechange', () =>{
    if(worker.state == 'installed'){
      updateReady(worker);
    }
  });
}

updateReady = worker => {
  console.log("Update Ready");
  const dialog = document.getElementById('refresh-dialog');
  const buttons = dialog.getElementsByTagName('button');
  for(let button of buttons){
    button.addEventListener('click', e => {this.onClick(e, worker)})
  }
  dialog.classList.remove('hidden');
  document.getElementById('dialog-spacer').classList.remove('hidden');
  document.getElementById('refresh-button').focus();
}

onClick = (e, worker) => {
  if(e.target.value === 'refresh')
    worker.postMessage({action: 'skipWaiting'})
  else
    document.getElementById('refresh-dialog').classList.add('hidden');
    document.getElementById('dialog-spacer').classList.add('hidden');
}