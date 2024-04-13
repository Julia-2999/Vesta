import { Injectable } from '@angular/core';
import { Building } from '../models/building.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable,firstValueFrom  } from 'rxjs';
import { BuildingPlan } from '../models/buildingPlan.model';
import { BuildingDevice } from '../models/buildingDevice.model';
import { BuildingServiceDoc } from '../models/buildingServiceDoc.model';
import { BuildingPerson } from '../models/buildingPerson.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  private storageImagePath = 'images';

  buildingsRef: AngularFirestoreCollection<Building>;
  buildingPlansRef: AngularFirestoreCollection<BuildingPlan>;
  buildingDevicesRef: AngularFirestoreCollection<BuildingDevice>;
  buildingServiceDocsRef: AngularFirestoreCollection<BuildingServiceDoc>;
  buildingPersonsRef: AngularFirestoreCollection<BuildingPerson>;

  constructor(private db: AngularFirestore,
    private storage: AngularFireStorage) {
    this.buildingsRef = db.collection('/buildings');
    this.buildingPlansRef = db.collection('/buildingPlans');
    this.buildingDevicesRef = db.collection('/buildingDevices');
    this.buildingServiceDocsRef = db.collection('/buildingServiceDocs');
    this.buildingPersonsRef = db.collection('/buildingPersons');
  }


 //Building
  getAllBuildings(availableBuildingIds: string = null): AngularFirestoreCollection<Building> {
    if (availableBuildingIds) {
        const idsArray = availableBuildingIds.split(',');
        return this.db.collection<Building>('/buildings', ref => ref.where('id', 'in', idsArray));
    } else {
      return this.buildingsRef;
    }
  }

  async addBuilding(building: Building, selectedFile: File | null): Promise<any> {
    if (selectedFile) {
      return this.uploadImage(selectedFile).then((downloadURL) => {
        return this.buildingsRef.add({ ...building, imageUrl: downloadURL });
      });
    } else {
      const buildingData = { ...building };
      delete buildingData.id;
      const docRef = await this.buildingsRef.add(buildingData);
      await docRef.update({ id: docRef.id });

      return docRef;
    }
  }

  async deleteBuildingAndImage(id: string): Promise<void | null> {
    try {
      const imageUrl = await this.getBuildingImageUrl(id);

      if (imageUrl) {
        const storageRef = this.storage.refFromURL(imageUrl);
        storageRef.delete();
        await this.db.doc<Building>(`buildings/${id}`).delete();
      } else {
        await this.db.doc<Building>(`buildings/${id}`).delete();
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania obrazka lub dokumentu:', error);
      return Promise.resolve(null);
    }
  }

  private async getBuildingImageUrl(id: string): Promise<string | null> {
    try {
      const building = await firstValueFrom(this.db.doc<Building>(`buildings/${id}`).valueChanges());
      return building?.imageUrl || null;
    } catch (error) {
      console.error('Błąd podczas pobierania URL obrazka:', error);
      return null;
    }
  }


  getBuildingData(buildingId: string): Observable<Building> {
    return this.buildingsRef.doc<Building>(buildingId).valueChanges();
  }

  async editBuildingInfo(buildingId: string, updatedBuilding: Building, newImage: File | null): Promise<void> {
    if (newImage) {
      return this.uploadImage(newImage).then((imageUrl) => {
        if (updatedBuilding.imageUrl) {
          const storageRef = this.storage.refFromURL(updatedBuilding.imageUrl);
          storageRef.delete();
        }
        updatedBuilding.imageUrl = imageUrl;
        return this.buildingsRef.doc(buildingId).update(updatedBuilding);
      });
    } else {
      return this.buildingsRef.doc(buildingId).update(updatedBuilding);
    }
  }

  private async uploadImage(image: File | undefined): Promise<string> {
    if (!image) {
      return Promise.resolve('');
    }

    const fileExtension = image.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.random()}.${fileExtension}`;
    const filePath = `${this.storageImagePath}/${uniqueFilename}`;
    const task = this.storage.upload(filePath, image);

    return task.then((snapshot) => snapshot.ref.getDownloadURL());
  }



  //  Building plans
  getAllBuildingPlans(buildingId: string): AngularFirestoreCollection<BuildingPlan> {
    return this.db.collection<BuildingPlan>('/buildingPlans', (ref) =>
      ref.where('objectId', '==', buildingId)
    );
  }

  async addBuildingPlan(buildingPlan: BuildingPlan, selectedFile: File | null): Promise<any> {
    if (selectedFile) {
      return this.uploadImage(selectedFile).then((downloadURL) => {
        return this.buildingPlansRef.add({ ...buildingPlan, imageUrl: downloadURL });
      });
    } else {
      const buildingPlanData = { ...buildingPlan };
      delete buildingPlanData.id;
      return this.buildingPlansRef.add(buildingPlanData);
    }
  }

  async editBuildingPlan(planId: string, updatedPlan: BuildingPlan, newImage: File | null): Promise<void> {
    if (newImage) {
      return this.uploadImage(newImage).then((imageUrl) => {
        if (updatedPlan.imageUrl) {
          const storageRef = this.storage.refFromURL(updatedPlan.imageUrl);
          storageRef.delete();
        }
        updatedPlan.imageUrl = imageUrl;
        return this.buildingPlansRef.doc(planId).update(updatedPlan);
      });
    } else {
      return this.buildingPlansRef.doc(planId).update(updatedPlan);
    }
  }

  private async getPlanImageUrl(id: string): Promise<string | null> {
    try {
      const plan = await firstValueFrom(this.db.doc<BuildingPlan>(`buildingPLans/${id}`).valueChanges());
      return plan?.imageUrl || null;
    } catch (error) {
      console.error('Błąd podczas pobierania URL obrazka:', error);
      return null;
    }
  }

  async deletePlanAndImage(planId: string): Promise<void | null> {
    try {
      const imageUrl = await this.getPlanImageUrl(planId);

      if (imageUrl) {
        const storageRef = this.storage.refFromURL(imageUrl);
        storageRef.delete();
        await this.db.doc<BuildingPlan>(`buildingPlans/${planId}`).delete();
      } else {
        await this.db.doc<BuildingPlan>(`buildingPlans/${planId}`).delete();
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania obrazka lub dokumentu:', error);
      return Promise.resolve(null);
    }
  }

  getBuildingPlan(planId: string): Observable<BuildingPlan | undefined> {
    return this.buildingPlansRef.doc(planId).valueChanges();
  }


// Building persons
  addBuildingPerson(buildingPerson: BuildingPerson): Promise<any> {
    const buildingPersonData = { ...buildingPerson };
    delete buildingPersonData.id;
    return this.buildingPersonsRef.add(buildingPersonData);
  }

  async editBuildingPerson(buildingPersonId: string, updatedBuildingPerson: BuildingPerson): Promise<void> {
    return this.buildingPersonsRef.doc(buildingPersonId).update(updatedBuildingPerson);
  }

  getAllBuildingPersons(objectId: string): AngularFirestoreCollection<BuildingPerson> {
    return this.db.collection<BuildingPerson>('/buildingPersons', (ref) =>
      ref.where('objectId', '==', objectId)
    );
  }

  async deleteBuildingPerson(buildingPersonId: string): Promise<void | null> {
    try {
      await this.db.doc<BuildingPerson>(`/buildingPersons/${buildingPersonId}`).delete();
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania osoby:', error);
      return Promise.resolve(null);
    }
  }

  // Building devices

  getAllBuildingDevices(buildingId: string): AngularFirestoreCollection<BuildingDevice> {
    return this.db.collection<BuildingDevice>('/buildingDevices', (ref) =>
      ref.where('objectId', '==', buildingId)
    );
  }

  async addBuildingDevice(buildingDevice: BuildingDevice, selectedFile: File | null): Promise<any> {
    if (selectedFile) {
      return this.uploadImage(selectedFile).then((downloadURL) => {
        return this.buildingDevicesRef.add({ ...buildingDevice, imageUrl: downloadURL });
      });
    } else {
      const buildingDeviceData = { ...buildingDevice };
      delete buildingDeviceData.id;
      return this.buildingDevicesRef.add(buildingDeviceData);
    }
  }

  async editBuildingDevice(deviceId: string, updatedDevice: BuildingDevice, newImage: File | null): Promise<void> {
    if (newImage) {
      return this.uploadImage(newImage).then((imageUrl) => {
        if (updatedDevice.imageUrl) {
          const storageRef = this.storage.refFromURL(updatedDevice.imageUrl);
          storageRef.delete();
        }
        updatedDevice.imageUrl = imageUrl;
        return this.buildingDevicesRef.doc(deviceId).update(updatedDevice);
      });
    } else {
      return this.buildingDevicesRef.doc(deviceId).update(updatedDevice);
    }
  }

  private async getDeviceImageUrl(id: string): Promise<string | null> {
    try {
      const plan = await firstValueFrom(this.db.doc<BuildingDevice>(`buildingDevices/${id}`).valueChanges());
      return plan?.imageUrl || null;
    } catch (error) {
      console.error('Błąd podczas pobierania URL obrazka:', error);
      return null;
    }
  }

  async deleteDeviceAndImage(deviceId: string): Promise<void | null> {
    try {
      const imageUrl = await this.getDeviceImageUrl(deviceId);

      if (imageUrl) {
        const storageRef = this.storage.refFromURL(imageUrl);
        storageRef.delete();
        await this.db.doc<BuildingDevice>(`buildingDevices/${deviceId}`).delete();
      } else {
        await this.db.doc<BuildingDevice>(`buildingDevices/${deviceId}`).delete();
      }

      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania obrazka lub dokumentu:', error);
      return Promise.resolve(null);
    }
  }

  getBuildingDevice(deviceId: string): Observable<BuildingDevice | undefined> {
    return this.buildingDevicesRef.doc(deviceId).valueChanges();
  }

  //Building service docs
  addBuildingServiceDoc(buildingServiceDoc: BuildingServiceDoc): Promise<any> {
    const buildingServiceDocData = { ...buildingServiceDoc };
    delete buildingServiceDocData.id;
    return this.buildingServiceDocsRef.add(buildingServiceDocData);
  }

  async editBuildingServiceDoc(serviceDocId: string, updatedServiceDoc: BuildingServiceDoc): Promise<void> {
    return this.buildingServiceDocsRef.doc(serviceDocId).update(updatedServiceDoc);
  }

  getAllBuildingServiceDocs(objectId: string): AngularFirestoreCollection<BuildingServiceDoc> {
    return this.db.collection<BuildingServiceDoc>('/buildingServiceDocs', (ref) =>
      ref.where('objectId', '==', objectId)
    );
  }


  getServicesForProperContractor(contractorId: string): AngularFirestoreCollection<BuildingServiceDoc> {
    return this.db.collection<BuildingServiceDoc>('/buildingServiceDocs', (ref) =>
      ref.where('contractor', '==', contractorId)
    );
  }

  async deleteServiceDoc(serviceDocId: string): Promise<void | null> {
    try {
      await this.db.doc<BuildingServiceDoc>(`buildingServiceDocs/${serviceDocId}`).delete();
      return Promise.resolve();
    } catch (error) {
      console.error('Błąd podczas usuwania dokumentu:', error);
      return Promise.resolve(null);
    }
  }
}
