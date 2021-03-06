import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
import { SPComponentLoader } from "@microsoft/sp-loader";
import styles from "./toaster.module.scss";
import * as strings from "ToastCustomizerApplicationCustomizerStrings";
import { IToast } from "../../services/toastService/IToast";
import { ToastService } from "../../services/toastService/ToastService";
import * as $ from "jquery";
import * as toastr from "toastr";

const LOG_SOURCE: string = "ToastCustomizerApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IToastCustomizerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ToastCustomizerApplicationCustomizer extends BaseApplicationCustomizer<
  IToastCustomizerApplicationCustomizerProperties
> {
  private toastsPromise: Promise<IToast[]>;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    SPComponentLoader.loadCss(
      "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css"
    );

    this.toastsPromise = ToastService.getToastsFromList(
      this.context.spHttpClient,
      this.context.pageContext.web.absoluteUrl
    );

    $(document).ready(() => {
      toastr.options.positionClass = `${styles.topRight} ${styles.spfxToastr}`;
      toastr.options.preventDuplicates = true;
      toastr.options.newestOnTop = false; //Ensures the first toast we send is on top
      toastr.options.timeOut = 0; //Prevents auto dismissal
      toastr.options.extendedTimeOut = 0; //Prevents auto dismissal during hover
      toastr.options.tapToDismiss = true; //Allows messages to go away on click
      toastr.options.closeButton = true; //Shows a close button to let end users know to click to close
      toastr.options.titleClass = "ms-font-m ms-fontWeight-semibold";
      toastr.options.messageClass = "ms-font-s";
      toastr.options.iconClasses = {
        info: `${styles.info} ${styles.fabricIcon} ms-Icon--Info`,
        warning: `${styles.warning} ${styles.fabricIcon} ms-Icon--Warning`,
        error: `${styles.error} ${styles.fabricIcon} ms-Icon--Error`,
        success: `${styles.success} ${styles.fabricIcon} ms-Icon--Completed`
      };

      //***********************
      //Toast Display
      //***********************

      this.toastsPromise
        .then((toasts: IToast[]) => {
          for (let t of toasts) {
            switch (t.Severity) {
              case "Warning":
                toastr.warning(t.Message, t.Title, {});
                break;
              case "Error":
                toastr.error(t.Message, t.Title, {});
                break;
              case "Success":
                toastr.success(t.Message, t.Title, {});
                break;
              default:
                toastr.info(t.Message, t.Title, {});
                break;
            }
          }
        })
        .catch((error: any): void => {
          toastr.error(error, strings.FailedToLoad);
        });
    });

    return Promise.resolve<void>();
  }
}
